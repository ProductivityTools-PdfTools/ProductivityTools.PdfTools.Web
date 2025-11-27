import { gql } from 'apollo-angular'

const SAY_HELLO=gql`
mutation SayHello($name:String!){
    Hello(name:$name)
}
`
export {
    SAY_HELLO
}