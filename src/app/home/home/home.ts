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

  name: string = "pawel"

  ngOnInit(): void {
    this.homeService.sayHello("pawel").subscribe((result: any) => {
      this.name = result.data.Hello;
      console.log(this.name);
    });
  }
}
