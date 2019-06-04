import { PackageBenchmarkSummary, Document } from '../common';
export interface FormatOptions {
    precision?: number;
    indent?: number;
    percentage?: boolean;
}
export declare const enum SignificanceLevel {
    Warning = "warning",
    Alert = "alert",
    Awesome = "awesome"
}
export interface Metric {
    columnName: string;
    sentenceName: string;
    formatOptions?: FormatOptions;
    getValue: (x: Document<PackageBenchmarkSummary>) => number | undefined;
    getSignificance: (percentDiff: number, before: Document<PackageBenchmarkSummary>, after: Document<PackageBenchmarkSummary>) => SignificanceLevel | undefined;
}
export declare type MetricName = 'typeCount' | 'memoryUsage' | 'assignabilityCacheSize' | 'subtypeCacheSize' | 'identityCacheSize' | 'samplesTaken' | 'identifierCount' | 'completionsMean' | 'completionsMedian' | 'completionsStdDev' | 'completionsAvgCV' | 'quickInfoMean' | 'quickInfoMedian' | 'quickInfoStdDev' | 'quickInfoAvgCV' | 'completionsWorstMean' | 'quickInfoWorstMean';
export declare const metrics: {
    [K in MetricName]: Metric;
};
export interface ComparedMetric {
    metric: Metric;
    percentDiff: number;
    significance: SignificanceLevel;
}
export declare function getInterestingMetrics(before: Document<PackageBenchmarkSummary>, after: Document<PackageBenchmarkSummary>): ComparedMetric[];
