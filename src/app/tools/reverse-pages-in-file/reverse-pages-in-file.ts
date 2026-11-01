import { Component, inject, signal } from '@angular/core';
import { ToolsService } from '../tools.service';
import { FileAccessService, PDF_TYPES } from '../file-access.service';

@Component({
  selector: 'app-reverse-pages-in-file',
  imports: [],
  templateUrl: './reverse-pages-in-file.html',
  styleUrl: './reverse-pages-in-file.css',
})
export class ReversePagesInFile {

  constructor(private toolsService: ToolsService) { }

  private readonly fileAccess = inject(FileAccessService);

  file = signal<File | null>(null);

  onFileSelected(event: any) {
    this.file.set(event.target.files[0]);
  }

  /** Uses the File System Access picker when available (so the result can be saved next to the source). */
  async pickFile(event: Event) {
    const picked = await this.fileAccess.pick(event, PDF_TYPES, false);
    if (picked?.length) this.file.set(picked[0]);
  }

  reversePagesInFile() {
    const f = this.file();
    if (f) {
      this.toolsService.reversePagesInFile(f).subscribe({
        next: (event: any) => {
          if (event.type === 4) { // HttpResponse
            console.log('Response finished');
            const blob = event.body;
            if (blob) {
              this.fileAccess.save(blob, 'reversed.pdf', f, PDF_TYPES);
            }
          } else {
            console.log('Progress/Other Event:', event);
          }
        },
        error: (error: any) => {
          console.error('Error:', error);
        }
      });
    } else {
      console.error('File not selected');
    }
  }
}
