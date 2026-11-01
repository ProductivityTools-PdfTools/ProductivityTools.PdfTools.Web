import { Injectable, signal } from '@angular/core';

export type StatusType = 'pending' | 'success' | 'error' | 'warn' | 'info';

export interface StatusEntry {
  id: number;
  message: string;
  type: StatusType;
  timestamp: Date;
  durationMs?: number;
}

const MAX_HISTORY = 50;

/**
 * Collects status messages shown in the session bar (port of statusService.js
 * from ProductivityTools.Journal.Web).
 *
 * Usage:
 *   const id = status.start('Uploading...');
 *   status.success(id, 'Uploaded');   // or status.error(id, 'Failed')
 *   status.info('Something happened');
 */
@Injectable({ providedIn: 'root' })
export class StatusService {
  readonly current = signal<StatusEntry | null>(null);
  readonly history = signal<StatusEntry[]>([]);

  private counter = 0;
  private readonly startTimes = new Map<number, number>();

  start(message: string): number {
    const entry: StatusEntry = { id: ++this.counter, message, type: 'pending', timestamp: new Date() };
    this.startTimes.set(entry.id, performance.now());
    this.push(entry);
    return entry.id;
  }

  success(idOrMessage: number | string, message?: string): void {
    this.complete('success', idOrMessage, message, 'Completed');
  }

  error(idOrMessage: number | string, message?: string): void {
    this.complete('error', idOrMessage, message, 'Operation failed');
  }

  info(message: string): void {
    this.push({ id: ++this.counter, message, type: 'info', timestamp: new Date() });
  }

  warn(message: string): void {
    this.push({ id: ++this.counter, message, type: 'warn', timestamp: new Date() });
  }

  clearHistory(): void {
    this.history.set([]);
  }

  private complete(type: StatusType, idOrMessage: number | string, message: string | undefined, fallback: string) {
    if (typeof idOrMessage === 'string') {
      this.push({ id: ++this.counter, message: idOrMessage, type, timestamp: new Date() });
      return;
    }

    const id = idOrMessage;
    const startTime = this.startTimes.get(id);
    this.startTimes.delete(id);
    const durationMs = startTime !== undefined ? Math.round(performance.now() - startTime) : undefined;
    const entry: StatusEntry = { id, message: message || fallback, type, timestamp: new Date(), durationMs };

    // Update the pending entry in place so the history shows one line per operation.
    this.history.update((items) => {
      const exists = items.some((item) => item.id === id);
      return exists ? items.map((item) => (item.id === id ? entry : item)) : [entry, ...items].slice(0, MAX_HISTORY);
    });
    this.current.set(entry);
  }

  private push(entry: StatusEntry) {
    this.history.update((items) => [entry, ...items].slice(0, MAX_HISTORY));
    this.current.set(entry);
  }
}
