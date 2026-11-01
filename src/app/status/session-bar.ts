import { Component, HostListener, ElementRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { StatusService, StatusType } from './status.service';

/** Thin bar at the top of the page – port of SessionBar.js from Journal. */
@Component({
  selector: 'app-session-bar',
  imports: [DatePipe],
  templateUrl: './session-bar.html',
  styleUrl: './session-bar.css',
})
export class SessionBar {
  protected readonly auth = inject(AuthService);
  protected readonly status = inject(StatusService);
  private readonly host = inject(ElementRef);

  protected readonly historyOpen = signal(false);
  protected readonly refreshing = signal(false);

  protected toggleHistory() {
    this.historyOpen.update((open) => !open);
  }

  protected async refreshToken() {
    this.refreshing.set(true);
    try {
      this.status.info('Forced token refresh requested');
      await this.auth.refreshToken();
      this.status.success('Token refreshed successfully');
    } catch (err) {
      console.error('Failed to refresh token', err);
      this.status.error('Token refresh failed');
    } finally {
      this.refreshing.set(false);
    }
  }

  protected logout() {
    this.historyOpen.set(false);
    this.auth.logout();
  }

  protected icon(type: StatusType | undefined): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '!';
      case 'warn': return '⚠';
      case 'info': return 'i';
      default: return '';
    }
  }

  // Close the history popover when clicking outside of it or pressing Escape.
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent) {
    if (this.historyOpen() && !this.host.nativeElement.contains(event.target)) {
      this.historyOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape() {
    this.historyOpen.set(false);
  }
}
