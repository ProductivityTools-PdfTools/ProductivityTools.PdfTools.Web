import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ToolsService } from '../tools.service';
import { FileAccessService, PDF_TYPES, ZIP_TYPES } from '../file-access.service';
import { ConversionConfig, WORD_CONVERSION } from './conversion-config';

/**
 * Converts every dropped/selected file to its own PDF and downloads them as a ZIP.
 * Used by "Files to PDF" (Word) and "Images to PDF" – see conversion-config.ts.
 */
@Component({
  selector: 'app-files-to-pdf',
  imports: [],
  templateUrl: './files-to-pdf.html',
  styleUrl: './files-to-pdf.css',
})
export class FilesToPdf {
  constructor(private toolsService: ToolsService) { }

  private readonly fileAccess = inject(FileAccessService);

  readonly config: ConversionConfig = inject(ActivatedRoute).snapshot.data['conversion'] ?? WORD_CONVERSION;

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
    // Keeps file handles (Chrome/Edge) so the ZIP can be saved next to the source files.
    this.addFiles(await this.fileAccess.fromDrop(event));
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
    // Reset the input so the same file can be selected again.
    input.value = '';
  }

  /** Uses the File System Access picker when available (so the result can be saved next to the source files). */
  async pickFiles(event: Event) {
    const picked = await this.fileAccess.pick(event, this.config.pickerTypes, true);
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
    this.toolsService.convertToZip(this.config.endpoint, files).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.Response) {
          const blob = event.body;
          if (blob) {
            // The save dialog opens in the folder of the first file on the list.
            // For a single file the API may return the PDF itself instead of a ZIP.
            const isPdf = (event.headers?.get('Content-Type') ?? '').startsWith('application/pdf');
            if (isPdf) {
              this.fileAccess.save(blob, this.pdfName(files[0]), files[0], PDF_TYPES);
            } else {
              this.fileAccess.save(blob, this.config.zipName, files[0], ZIP_TYPES);
            }
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
    const supported = selected.filter((f) => this.config.extensions.includes(this.extension(f.name)));
    const skipped = selected.filter((f) => !supported.includes(f));

    this.files.update((current) => [...current, ...supported]);
    this.error.set(null);
    this.warning.set(skipped.length > 0
      ? `Skipped (supported: ${this.config.formats}): ${skipped.map((f) => f.name).join(', ')}`
      : null);
  }

  private extension(name: string): string {
    const dot = name.lastIndexOf('.');
    return dot >= 0 ? name.substring(dot + 1).toLowerCase() : '';
  }

  /** report.docx -> report.pdf */
  pdfName(file: File): string {
    const dot = file.name.lastIndexOf('.');
    return `${dot > 0 ? file.name.substring(0, dot) : file.name}.pdf`;
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
