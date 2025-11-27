import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from "apollo-angular";
import { Observable } from 'rxjs';
import { SAY_HELLO } from '../graphql/graphql.queries';


@Injectable({
  providedIn: 'root',
})
export class HomeService {

  constructor(private apollo:Apollo) {}

  sayHello(name:string):Observable<any>{
    return this.apollo.mutate({
      mutation:SAY_HELLO,
      variables:{
        name:name
      }
    })
  }
}
