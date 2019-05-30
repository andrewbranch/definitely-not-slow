import { PackageBenchmarkSummary, Document } from '../common';
export declare function createComparisonTable(before: Document<PackageBenchmarkSummary>, after: Document<PackageBenchmarkSummary>, beforeTitle: string, afterTitle: string): string;
export declare function createSingleRunTable(benchmark: Document<PackageBenchmarkSummary>): string;
