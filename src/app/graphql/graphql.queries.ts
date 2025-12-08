import { gql } from 'apollo-angular'

const SAY_HELLO = gql`
mutation SayHello($name:String!){
    Hello(name:$name)
}
`

const MERGE_FILES = gql`
mutation MergeFiles($file1:Upload!, $file2:Upload!){
    MergeFiles(file1:$file1, file2:$file2)
}
`

export {
    SAY_HELLO,
    MERGE_FILES
}