import { Component, computed, inject, signal } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { ToolsService } from '../tools.service';
import { FileAccessService, IMAGE_TYPES, PDF_TYPES } from '../file-access.service';

@Component({
  selector: 'app-images-to-pdf',
  imports: [],
  templateUrl: './images-to-pdf.html',
  styleUrl: './images-to-pdf.css',
})
export class ImagesToPdf {
  constructor(private toolsService: ToolsService) { }

  private readonly fileAccess = inject(FileAccessService);

  files = signal<File[]>([]);
  inProgress = signal(false);
  error = signal<string | null>(null);

  // The output PDF is named after the first image on the list (the first page).
  outputFileName = computed(() => {
    const first = this.files()[0];
    if (!first) return 'images.pdf';
    const dot = first.name.lastIndexOf('.');
    const baseName = dot > 0 ? first.name.substring(0, dot) : first.name;
    return `${baseName}.pdf`;
  });

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
    // Reset the input so the same file can be selected again.
    input.value = '';
  }

  /** Uses the File System Access picker when available (so the result can be saved next to the images). */
  async pickFiles(event: Event) {
    const picked = await this.fileAccess.pick(event, IMAGE_TYPES, true);
    if (picked) this.addFiles(picked);
  }

  private addFiles(selected: File[]) {
    // Append to the current list so images can be picked in several rounds.
    this.files.update((current) => [...current, ...selected]);
    this.error.set(null);
  }

  moveUp(index: number) {
    if (index === 0) return;
    this.files.update((current) => {
      const copy = [...current];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  }

  moveDown(index: number) {
    if (index === this.files().length - 1) return;
    this.files.update((current) => {
      const copy = [...current];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  }

  remove(index: number) {
    this.files.update((current) => current.filter((_, i) => i !== index));
  }

  /** Removes all added files and starts over. */
  reset() {
    this.files.set([]);
    this.error.set(null);
  }

  convert() {
    const files = this.files();
    if (files.length === 0) {
      console.error('No images selected');
      return;
    }

    this.inProgress.set(true);
    this.error.set(null);
    this.toolsService.imagesToPdf(files).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.Response) {
          const blob = event.body;
          if (blob) {
            // The save dialog opens in the folder of the first image on the list.
            this.fileAccess.save(blob, this.outputFileName(), files[0], PDF_TYPES);
          }
          this.inProgress.set(false);
        }
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error.set('Conversion failed. Check that all files are JPG, PNG, GIF or BMP images.');
        this.inProgress.set(false);
      }
    });
  }
}
