import { Component, signal } from '@angular/core';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { ToolsService } from '../tools.service';

const SUPPORTED_EXTENSIONS = ['doc', 'docx'];

@Component({
  selector: 'app-files-to-pdf',
  imports: [],
  templateUrl: './files-to-pdf.html',
  styleUrl: './files-to-pdf.css',
})
export class FilesToPdf {
  constructor(private toolsService: ToolsService) { }

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

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver.set(false);
    this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
    // Reset the input so the same file can be selected again.
    input.value = '';
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
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted.zip';
            a.click();
            URL.revokeObjectURL(url);
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
