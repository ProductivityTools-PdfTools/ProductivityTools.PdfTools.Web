import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { HomeService } from '../home.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private homeService = inject(HomeService);

  name = toSignal(
    this.homeService.sayHello('Pawel').pipe(map((r) => r.message)),
    { initialValue: 'loading...' }
  );

  helloworld = toSignal(
    this.homeService.sayHelloWorld().pipe(map((r) => r.message)),
    { initialValue: 'loading...' }
  );
}
