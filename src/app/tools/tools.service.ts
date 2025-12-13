import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ToolsService {

  constructor(private http: HttpClient) { }

  mergeFiles(file1: File, file2: File): Observable<any> {
    const formData: FormData = new FormData();

    // The key 'file' must match what your backend expects
    formData.append('file1', file1);
    formData.append('file2', file2);

    const req = new HttpRequest('POST', 'http://localhost:8080/api/merge-odd-even-pages', formData, {
      reportProgress: true, // Set to true to track upload percentage
      responseType: 'blob'
    });

    return this.http.request(req);
  }
}
