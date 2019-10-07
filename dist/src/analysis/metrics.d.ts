import { PackageBenchmarkSummary, Document } from '../common';
export interface FormatOptions {
    precision?: number;
    indent?: number;
    percentage?: boolean;
    noDiff?: boolean;
}
export declare const enum SignificanceLevel {
    Warning = "warning",
    Alert = "alert",
    Awesome = "awesome"
}
export declare type GetSignificance = (percentDiff: number, beforeValue: number, afterValue: number, beforeDoc: Document<PackageBenchmarkSummary>, afterDoc: Document<PackageBenchmarkSummary>) => SignificanceLevel | undefined;
export declare type CreateGetSignificance = (getSignificance: GetSignificance) => GetSignificance;
export interface Metric {
    columnName: string;
    sentenceName: string;
    formatOptions?: FormatOptions;
    getValue: (x: Document<PackageBenchmarkSummary>) => number | undefined;
    getSignificance: GetSignificance;
}
export declare type MetricName = 'typeCount' | 'memoryUsage' | 'assignabilityCacheSize' | 'samplesTaken' | 'identifierCount' | 'completionsMean' | 'completionsStdDev' | 'completionsAvgCV' | 'quickInfoMean' | 'quickInfoStdDev' | 'quickInfoAvgCV' | 'completionsWorstMean' | 'quickInfoWorstMean';
export declare const metrics: {
    [K in MetricName]: Metric;
};
export interface ComparedMetric {
    metric: Metric;
    percentDiff: number;
    significance: SignificanceLevel;
}
export declare function getInterestingMetrics(before: Document<PackageBenchmarkSummary>, after: Document<PackageBenchmarkSummary>): ComparedMetric[];
