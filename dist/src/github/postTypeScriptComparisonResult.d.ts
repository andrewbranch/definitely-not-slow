import { PackageBenchmarkSummary, Document } from "../common";
declare type BeforeAndAfter = [Document<PackageBenchmarkSummary>, Document<PackageBenchmarkSummary>];
export interface PostTypeScriptComparisonResultsOptions {
    comparisons: BeforeAndAfter[];
    dryRun: boolean;
}
export declare function postTypeScriptComparisonResults({ comparisons, }: PostTypeScriptComparisonResultsOptions): Promise<string>;
export {};
