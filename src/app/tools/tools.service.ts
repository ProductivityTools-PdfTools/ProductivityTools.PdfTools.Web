import { HttpRequest, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class ToolsService {
  private readonly apiUrl = inject(API_URL);
  private readonly http = inject(HttpClient);

  mergeFiles(file1: File, file2: File): Observable<any> {
    const formData: FormData = new FormData();

    // The key 'file' must match what your backend expects
    formData.append('file1', file1);
    formData.append('file2', file2);

    const req = new HttpRequest('POST', `${this.apiUrl}merge-odd-even-pages`, formData, {
      reportProgress: true, // Set to true to track upload percentage
      responseType: 'blob'
    });

    return this.http.request(req);
  }

  reversePagesInFile(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    const req = new HttpRequest('POST', `${this.apiUrl}reverse-pages-in-file`, formData, {
      reportProgress: true,
      responseType: 'blob'
    });
    return this.http.request(req);
  }
}
