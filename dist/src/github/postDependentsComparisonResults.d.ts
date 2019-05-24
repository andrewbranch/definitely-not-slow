import { PackageBenchmarkSummary, Document } from '../common';
declare type BeforeAndAfter = [Document<PackageBenchmarkSummary>, Document<PackageBenchmarkSummary>];
export declare function postDependentsComparisonResult(comparisons: BeforeAndAfter[]): Promise<import("@octokit/rest").Response<import("@octokit/rest").IssuesCreateCommentResponse>>;
export {};
