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
        next: (event: any) => {
          if (event.type === 4) { // HttpResponse
            console.log('Response finished');
            const blob = event.body;
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'reversed.pdf';
              a.click();
              URL.revokeObjectURL(url);
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
