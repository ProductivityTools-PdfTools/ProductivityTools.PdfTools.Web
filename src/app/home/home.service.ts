import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from "apollo-angular";
import { Observable } from 'rxjs';
import { MERGE_FILES, SAY_HELLO } from '../graphql/graphql.queries';


@Injectable({
  providedIn: 'root',
})
export class HomeService {

  constructor(private apollo: Apollo) { }

  sayHello(name: string): Observable<any> {
    return this.apollo.mutate({
      mutation: SAY_HELLO,
      variables: {
        name: name
      }
    })
  }

  mergeFiles(file1: File, file2: File): Observable<any> {
    return this.apollo.mutate({
      mutation: MERGE_FILES,
      variables: {
        file1: file1,
        file2: file2
      },
      context: {
        useMultipart: true
      }
    })
  }
}
