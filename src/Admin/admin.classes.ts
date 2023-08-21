import { TPaginated } from '../types/entities.types'
import { IssueModelClass } from '../Common/common.classes'

export type TGetIssuesParams = {
    offset?: number
}
export type AdminIssuesResponse = TPaginated<IssueModelClass & {
    user: {
        name: string,
        _id: string
    }
}>
