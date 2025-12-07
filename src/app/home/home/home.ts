import { Component, ChangeDetectorRef } from '@angular/core';
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
}
