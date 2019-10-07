import { PackageBenchmarkSummary, Document } from '../common';
declare type BeforeAndAfter = [Document<PackageBenchmarkSummary> | undefined, Document<PackageBenchmarkSummary>];
export declare enum OverallChange {
    Same = 0,
    Worse = 1,
    Better = 2,
    Mixed = 3
}
export declare function getOverallChangeForSingleComparison(before: Document<PackageBenchmarkSummary>, after: Document<PackageBenchmarkSummary>): OverallChange;
export declare function getOverallChangeForComparisons(comparisons: BeforeAndAfter[]): OverallChange;
export {};
