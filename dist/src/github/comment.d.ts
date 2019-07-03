import { IssuesListCommentsResponseItem } from "@octokit/rest";
export declare function createPerfCommentBody(body: string): string;
export declare function isPerfComment({ body, user }: Pick<IssuesListCommentsResponseItem, 'body' | 'user'>): boolean;
