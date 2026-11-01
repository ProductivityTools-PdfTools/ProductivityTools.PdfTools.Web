import { Injectable, inject } from '@angular/core';
import { StatusService } from '../status/status.service';

/** File type filter for the native pickers, e.g. { 'application/pdf': ['.pdf'] }. */
export type AcceptTypes = Record<string, string[]>;

export const PDF_TYPES: AcceptTypes = { 'application/pdf': ['.pdf'] };
export const ZIP_TYPES: AcceptTypes = { 'application/zip': ['.zip'] };
export const IMAGE_TYPES: AcceptTypes = { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'] };
export const WORD_TYPES: AcceptTypes = {
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

/**
 * Opens and saves files so that the "Save" dialog starts in the folder the
 * source files came from.
 *
 * Browsers never expose file paths, but Chrome/Edge (File System Access API)
 * return a handle for files picked with showOpenFilePicker() or dropped onto
 * the page; passing that handle as `startIn` to showSaveFilePicker() opens the
 * dialog in the same folder. Other browsers (Firefox, Safari) fall back to the
 * regular <input type="file"> and a normal download.
 */
@Injectable({ providedIn: 'root' })
export class FileAccessService {
  private readonly status = inject(StatusService);

  /** Handle of every file opened through this service (if the browser provided one). */
  private readonly handles = new WeakMap<File, FileSystemFileHandle>();

  get supported(): boolean {
    return typeof window !== 'undefined' && 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
  }

  /**
   * Click handler for <input type="file">: in supporting browsers it replaces the
   * native dialog with showOpenFilePicker() (which returns file handles).
   * Returns null when the native input should be used instead (or the user cancelled).
   */
  async pick(event: Event, types: AcceptTypes, multiple: boolean): Promise<File[] | null> {
    if (!this.supported) return null;
    event.preventDefault();
    try {
      const handles: FileSystemFileHandle[] = await (window as any).showOpenFilePicker({
        multiple,
        id: 'pdftools-open',
        types: [{ description: 'Files', accept: types }],
      });
      return await Promise.all(handles.map((handle) => this.register(handle)));
    } catch (err) {
      if (this.isAbort(err)) return null;
      throw err;
    }
  }

  /** Files dropped onto the page, with handles when the browser provides them. */
  async fromDrop(event: DragEvent): Promise<File[]> {
    const transfer = event.dataTransfer;
    if (!transfer) return [];

    // DataTransfer items are only valid during the event, so collect everything synchronously first.
    const items = Array.from(transfer.items).filter((item) => item.kind === 'file');
    const pending = items.map((item) => {
      const file = item.getAsFile();
      const handlePromise: Promise<FileSystemHandle | null> | undefined =
        (item as any).getAsFileSystemHandle?.();
      return { file, handlePromise };
    });

    const files: File[] = [];
    for (const { file, handlePromise } of pending) {
      if (!file) continue;
      try {
        const handle = handlePromise ? await handlePromise : null;
        if (handle && handle.kind === 'file') {
          this.handles.set(file, handle as FileSystemFileHandle);
        }
      } catch {
        // No handle available – the file still works, the save dialog just won't start in its folder.
      }
      files.push(file);
    }
    return files;
  }

  /**
   * Saves the result. In supporting browsers shows the "Save" dialog opened in the
   * folder of `sourceFile`; otherwise downloads the file as before.
   */
  async save(blob: Blob, suggestedName: string, sourceFile: File | null | undefined, types: AcceptTypes) {
    if (!this.supported) {
      this.download(blob, suggestedName);
      return;
    }

    const startIn = sourceFile ? this.handles.get(sourceFile) : undefined;
    try {
      const target: FileSystemFileHandle = await (window as any).showSaveFilePicker({
        suggestedName,
        // `id` makes the browser remember the last folder when there is no source handle.
        id: 'pdftools-save',
        ...(startIn ? { startIn } : {}),
        types: [{ description: suggestedName, accept: types }],
      });
      const writable = await (target as any).createWritable();
      await writable.write(blob);
      await writable.close();
      this.status.success(`Saved ${target.name}`);
    } catch (err) {
      if (this.isAbort(err)) {
        this.status.info('Save cancelled');
        return;
      }
      // E.g. the user picked a protected folder – fall back to a normal download.
      console.error('Save failed, downloading instead', err);
      this.download(blob, suggestedName);
    }
  }

  private async register(handle: FileSystemFileHandle): Promise<File> {
    const file = await handle.getFile();
    this.handles.set(file, handle);
    return file;
  }

  private download(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  private isAbort(err: unknown): boolean {
    return err instanceof DOMException && err.name === 'AbortError';
  }
}
