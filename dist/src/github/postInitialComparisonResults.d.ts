import { PackageBenchmarkSummary, Document } from '../common';
declare type BeforeAndAfter = [Document<PackageBenchmarkSummary> | undefined, Document<PackageBenchmarkSummary>];
export interface PostInitialComparisonResultsOptions {
    comparisons: BeforeAndAfter[];
    dependentCount: number;
    dryRun: boolean;
}
export declare function postInitialComparisonResults({ comparisons, dependentCount, dryRun, }: PostInitialComparisonResultsOptions): Promise<string>;
export {};
