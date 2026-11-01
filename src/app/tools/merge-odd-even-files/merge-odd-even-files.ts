import { Component, inject, signal } from '@angular/core';
import { ToolsService } from '../tools.service';
import { FileAccessService, PDF_TYPES } from '../file-access.service';

@Component({
  selector: 'app-merge-odd-even-files',
  imports: [],
  templateUrl: './merge-odd-even-files.html',
  styleUrl: './merge-odd-even-files.css',
})
export class MergeOddEvenFiles {
  constructor(private toolsService: ToolsService) { }

  private readonly fileAccess = inject(FileAccessService);

  file1 = signal<File | null>(null);
  file2 = signal<File | null>(null);
  onFile1Selected(event: any) {
    this.file1.set(event.target.files[0]);
  }

  onFile2Selected(event: any) {
    this.file2.set(event.target.files[0]);
  }

  /** Uses the File System Access picker when available (so the result can be saved next to the sources). */
  async pickFile1(event: Event) {
    const picked = await this.fileAccess.pick(event, PDF_TYPES, false);
    if (picked?.length) this.file1.set(picked[0]);
  }

  async pickFile2(event: Event) {
    const picked = await this.fileAccess.pick(event, PDF_TYPES, false);
    if (picked?.length) this.file2.set(picked[0]);
  }

  mergeFiles() {
    const f1 = this.file1();
    const f2 = this.file2();

    if (f1 && f2) {
      this.toolsService.mergeFiles(f1, f2).subscribe({
        next: (event: any) => {
          if (event.type === 4) { // HttpResponse
            console.log('Response finished');
            const blob = event.body;
            if (blob) {
              // The save dialog opens in the folder of the odd pages file.
              this.fileAccess.save(blob, 'merged.pdf', f1, PDF_TYPES);
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
      console.error('Files not selected');
    }
  }
}
