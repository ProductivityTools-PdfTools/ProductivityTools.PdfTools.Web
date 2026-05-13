import { Component, signal } from '@angular/core';
import { ToolsService } from '../tools.service';


@Component({
  selector: 'app-split-into-pages',
  imports: [],
  templateUrl: './split-into-pages.html',
  styleUrl: './split-into-pages.css',
})
export class SplitIntoPages {

  file = signal<File | null>(null);

  onFileSelected(event: any) {
    this.file.set(event.target.files[0]);
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
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              // Assuming the backend returns a zip file containing the pages
              a.download = 'split_pages.zip';
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
      console.error('No file selected');
    }
  }
}
