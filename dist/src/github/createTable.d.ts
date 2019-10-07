import { PackageBenchmarkSummary, Document } from '../common';
import { SignificanceLevel } from '../analysis';
export declare function createComparisonTable(before: Document<PackageBenchmarkSummary>, after: Document<PackageBenchmarkSummary>, beforeTitle: string, afterTitle: string): string;
export declare function createSingleRunTable(benchmark: Document<PackageBenchmarkSummary>): string;
export declare function formatDiff(percentDiff: number, significance: SignificanceLevel | undefined, precision?: number): string;
