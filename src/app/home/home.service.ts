import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HelloResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private readonly uri = isDevMode()
    ? 'http://localhost:8080/api/'
    : 'https://pt-pdf-tools-api-93484780890.europe-west1.run.app/api/';

  constructor(private http: HttpClient) { }

  sayHello(name: string): Observable<HelloResponse> {
    return this.http.post<HelloResponse>(`${this.uri}hello`, { name });
  }

  sayHelloWorld(): Observable<HelloResponse> {
    return this.http.get<HelloResponse>(`${this.uri}hello-world`);
  }
}
