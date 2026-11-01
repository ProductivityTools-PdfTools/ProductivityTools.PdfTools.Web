import { Component, inject, signal } from '@angular/core';
import { ToolsService } from '../tools.service';
import { FileAccessService, PDF_TYPES, ZIP_TYPES } from '../file-access.service';


@Component({
  selector: 'app-split-into-pages',
  imports: [],
  templateUrl: './split-into-pages.html',
  styleUrl: './split-into-pages.css',
})
export class SplitIntoPages {

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

  constructor(private toolsService: ToolsService) { }

  splitPages() {
    const f = this.file();
    if (f) {
      console.log('Processing file:', f.name);
      this.toolsService.splitPages(f).subscribe({
        next: (event: any) => {
          if (event.type === 4) { // HttpResponse
            console.log('Response finished');
            const blob = event.body;
            if (blob) {
              // The backend returns a zip file containing the pages
              this.fileAccess.save(blob, 'split_pages.zip', f, ZIP_TYPES);
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
      console.error('No file selected');
    }
  }
}
