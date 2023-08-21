import { Connection } from 'mongoose'
import { IssueSchema } from '../Schemas/issue.schema'

export const issueProvider = {
    provide: 'ISSUE_MODEL',
    useFactory: (connection: Connection) => connection.model('Issue', IssueSchema),
    inject: [ 'DATABASE_CONNECTION' ]
}
