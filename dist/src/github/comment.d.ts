import { IssuesListCommentsResponseItem } from '@octokit/rest';
import { OverallChange } from '../analysis';
export interface CommentData {
    overallChange?: OverallChange;
}
export declare function createPerfCommentBody(data: CommentData, body: string): string;
export declare function isPerfComment({ body, user }: Pick<IssuesListCommentsResponseItem, 'body' | 'user'>): boolean;
export declare function getCommentData(comment: Pick<IssuesListCommentsResponseItem, 'body' | 'user'>): CommentData | undefined;
