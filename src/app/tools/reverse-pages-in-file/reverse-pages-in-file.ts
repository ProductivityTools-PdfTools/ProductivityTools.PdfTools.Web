import { Component, signal } from '@angular/core';
import { ToolsService } from '../tools.service';

@Component({
  selector: 'app-reverse-pages-in-file',
  imports: [],
  templateUrl: './reverse-pages-in-file.html',
  styleUrl: './reverse-pages-in-file.css',
})
export class ReversePagesInFile {

  constructor(private toolsService: ToolsService) { }

  file = signal<File | null>(null);

  onFileSelected(event: any) {
    this.file.set(event.target.files[0]);
  }

  reversePagesInFile() {
    const f = this.file();
    if (f) {
      this.toolsService.reversePagesInFile(f).subscribe({
        next: (result: any) => {
          console.log('Response:', result);
          const blob = result.body;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'reversed.pdf';
          a.click();
          URL.revokeObjectURL(url);
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
