import { Component, signal } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { ToolsService } from '../tools.service';

@Component({
  selector: 'app-images-to-pdf',
  imports: [],
  templateUrl: './images-to-pdf.html',
  styleUrl: './images-to-pdf.css',
})
export class ImagesToPdf {
  constructor(private toolsService: ToolsService) { }

  files = signal<File[]>([]);
  inProgress = signal(false);
  error = signal<string | null>(null);

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    // Append to the current list so images can be picked in several rounds.
    this.files.update((current) => [...current, ...selected]);
    this.error.set(null);
    // Reset the input so the same file can be selected again.
    input.value = '';
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

  clear() {
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
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'images.pdf';
            a.click();
            URL.revokeObjectURL(url);
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
