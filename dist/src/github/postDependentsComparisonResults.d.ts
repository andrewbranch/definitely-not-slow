import { PackageBenchmarkSummary, Document } from '../common';
declare type BeforeAndAfter = [Document<PackageBenchmarkSummary> | undefined, Document<PackageBenchmarkSummary>];
export interface PostDependentsComparisonResultOptions {
    comparisons: BeforeAndAfter[];
    dryRun: boolean;
}
export declare function postDependentsComparisonResult({ comparisons, dryRun, }: PostDependentsComparisonResultOptions): Promise<string>;
export {};
