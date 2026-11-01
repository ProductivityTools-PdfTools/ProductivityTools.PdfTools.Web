import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { SessionBar } from './status/session-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref, RouterLinkActive, SessionBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ProductivityTools.PdfTools.Web');
  constructor(public authService: AuthService) { }

  logout() {
    this.authService.logout();
  }
}
