import { Component } from '@angular/core';
import { HomeService } from '../home.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(private homeService: HomeService) { }

  name: string = "server did not respondg"

  ngOnInit(): void {
    console.log('Home Component Initialized');
    this.homeService.sayHello("paweld").subscribe({
      next: (result: any) => {
        debugger;;
        console.log('GraphQL Response:', result);
        this.name = result.data.Hello;
      },
      error: (error: any) => {
        console.error('GraphQL Error:', error);
      }
    });
  }
}
