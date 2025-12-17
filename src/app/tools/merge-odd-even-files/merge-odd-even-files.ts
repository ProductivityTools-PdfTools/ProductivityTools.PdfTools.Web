import { Component, signal } from '@angular/core';
import { ToolsService } from '../tools.service';

@Component({
  selector: 'app-merge-odd-even-files',
  imports: [],
  templateUrl: './merge-odd-even-files.html',
  styleUrl: './merge-odd-even-files.css',
})
export class MergeOddEvenFiles {
  constructor(private toolsService: ToolsService) { }

  file1 = signal<File | null>(null);
  file2 = signal<File | null>(null);
  onFile1Selected(event: any) {
    this.file1.set(event.target.files[0]);
  }

  onFile2Selected(event: any) {
    this.file2.set(event.target.files[0]);
  }

  mergeFiles() {
    const f1 = this.file1();
    const f2 = this.file2();

    if (f1 && f2) {
      this.toolsService.mergeFiles(f1, f2).subscribe({
        next: (result: any) => {
          console.log('Response:', result);
          const blob = result.body;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'merged.pdf';
          a.click();
          URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          console.error('GraphQL Error:', error);
        }
      });
    } else {
      console.error('Files not selected');
    }
  }
}
