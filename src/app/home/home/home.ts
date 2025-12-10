import { Component, ChangeDetectorRef, signal } from '@angular/core';
import { HomeService } from '../home.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(private homeService: HomeService, private cdr: ChangeDetectorRef) { }

  name: string = "server did not respond"


  file1 = signal<File | null>(null);
  file2 = signal<File | null>(null);

  ngOnInit(): void {
    console.log('Home Component Initialized');
    this.homeService.sayHello("paweld").subscribe({
      next: (result: any) => {
        console.log('GraphQL Response:', result);
        if (result.data && result.data.Hello) {
          this.name = result.data.Hello;
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        console.error('GraphQL Error:', error);
      }
    });
  }

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
      this.homeService.mergeFiles(f1, f2).subscribe({
        next: (result: any) => {
          console.log('GraphQL Response:', result);
          if (result.data && result.data.UploadFiles) {
            this.name = result.data.UploadFiles;
            this.cdr.detectChanges();
          }
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
