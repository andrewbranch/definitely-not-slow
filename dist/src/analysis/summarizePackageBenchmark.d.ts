import { PackageBenchmark, PackageBenchmarkSummary, LanguageServiceBenchmark } from '../common';
export declare function summarize(benchmark: PackageBenchmark): PackageBenchmarkSummary;
export declare function summarizeStats(benchmarks: LanguageServiceBenchmark[]): Pick<PackageBenchmarkSummary, 'quickInfo' | 'completions'>;
