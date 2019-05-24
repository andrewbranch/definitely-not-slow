import { PackageBenchmarkSummary, Document } from '../common';
declare type BeforeAndAfter = [Document<PackageBenchmarkSummary>, Document<PackageBenchmarkSummary>];
export declare function postInitialComparisonResults(comparisons: BeforeAndAfter[], dependentCount: number): Promise<import("@octokit/rest").Response<import("@octokit/rest").IssuesCreateCommentResponse>>;
export {};
