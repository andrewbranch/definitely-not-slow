import { PackageBenchmarkSummary, Document } from '../common';
export interface FormatOptions {
    precision?: number;
    indent?: number;
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
export declare type MetricName = 'typeCount' | 'assignabilityCacheSize' | 'subtypeCacheSize' | 'identityCacheSize' | 'samplesTaken' | 'identifierCount' | 'completionsMean' | 'completionsMedian' | 'completionsStdDev' | 'quickInfoMean' | 'quickInfoMedian' | 'quickInfoStdDev' | 'completionsWorstMean' | 'quickInfoWorstMean';
export declare const metrics: {
    [K in MetricName]: Metric;
};
export declare function getInterestingMetrics(before: Document<PackageBenchmarkSummary>, after: Document<PackageBenchmarkSummary>): {
    metric: Metric;
    percentDiff: number;
    significance: SignificanceLevel;
}[];
