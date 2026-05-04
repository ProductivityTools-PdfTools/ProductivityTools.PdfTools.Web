import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../app.config';

export interface HelloResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private readonly apiUrl = inject(API_URL);
  private readonly http = inject(HttpClient);

  sayHello(name: string): Observable<HelloResponse> {
    return this.http.post<HelloResponse>(`${this.apiUrl}hello`, { name });
  }

  sayHelloWorld(): Observable<HelloResponse> {
    return this.http.get<HelloResponse>(`${this.apiUrl}hello-world`);
  }
}
