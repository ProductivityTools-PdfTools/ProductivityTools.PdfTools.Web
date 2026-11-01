import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { ToolsService } from '../tools.service';
import { FileAccessService, WORD_TYPES, ZIP_TYPES } from '../file-access.service';

const SUPPORTED_EXTENSIONS = ['doc', 'docx'];

@Component({
  selector: 'app-files-to-pdf',
  imports: [],
  templateUrl: './files-to-pdf.html',
  styleUrl: './files-to-pdf.css',
})
export class FilesToPdf {
  constructor(private toolsService: ToolsService) { }

  private readonly fileAccess = inject(FileAccessService);

  files = signal<File[]>([]);
  dragOver = signal(false);
  inProgress = signal(false);
  error = signal<string | null>(null);
  warning = signal<string | null>(null);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver.set(false);
  }

  async onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver.set(false);
    // Keeps file handles (Chrome/Edge) so the ZIP can be saved next to the documents.
    this.addFiles(await this.fileAccess.fromDrop(event));
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
    // Reset the input so the same file can be selected again.
    input.value = '';
  }

  /** Uses the File System Access picker when available (so the result can be saved next to the documents). */
  async pickFiles(event: Event) {
    const picked = await this.fileAccess.pick(event, WORD_TYPES, true);
    if (picked) this.addFiles(picked);
  }

  remove(index: number) {
    this.files.update((current) => current.filter((_, i) => i !== index));
  }

  /** Removes all added files and starts over. */
  reset() {
    this.files.set([]);
    this.error.set(null);
    this.warning.set(null);
  }

  convert() {
    const files = this.files();
    if (files.length === 0) return;

    this.inProgress.set(true);
    this.error.set(null);
    this.toolsService.filesToPdf(files).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.Response) {
          const blob = event.body;
          if (blob) {
            // The save dialog opens in the folder of the first document on the list.
            this.fileAccess.save(blob, 'converted.zip', files[0], ZIP_TYPES);
          }
          this.inProgress.set(false);
        }
      },
      error: async (error: unknown) => {
        console.error('Error:', error);
        this.error.set(await this.errorMessage(error));
        this.inProgress.set(false);
      }
    });
  }

  private addFiles(selected: File[]) {
    const supported = selected.filter((f) => SUPPORTED_EXTENSIONS.includes(this.extension(f.name)));
    const skipped = selected.filter((f) => !supported.includes(f));

    this.files.update((current) => [...current, ...supported]);
    this.error.set(null);
    this.warning.set(skipped.length > 0
      ? `Skipped (only .doc and .docx are supported): ${skipped.map((f) => f.name).join(', ')}`
      : null);
  }

  private extension(name: string): string {
    const dot = name.lastIndexOf('.');
    return dot >= 0 ? name.substring(dot + 1).toLowerCase() : '';
  }

  /** The API returns a JSON error ({ message: ... }), but with responseType 'blob' it arrives as a Blob. */
  private async errorMessage(error: unknown): Promise<string> {
    const fallback = 'Conversion failed.';
    if (!(error instanceof HttpErrorResponse)) return fallback;
    try {
      const body = error.error instanceof Blob ? JSON.parse(await error.error.text()) : error.error;
      return body?.message ? `Conversion failed: ${body.message}` : `${fallback} (${error.status})`;
    } catch {
      return `${fallback} (${error.status})`;
    }
  }
}
