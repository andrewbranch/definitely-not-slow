import { PackageBenchmarkSummary, Document } from '../common';
export interface FormatOptions {
    noDiff?: boolean;
    precision?: number;
    indent?: number;
}
export interface Metric {
    columnName: string;
    sentenceName: string;
    isUninteresting?: boolean;
    higherIsBetter?: boolean;
    formatOptions?: FormatOptions;
    getValue: (x: Document<PackageBenchmarkSummary>) => number | undefined;
}
export declare type MetricName = 'typeCount' | 'memoryUsage' | 'assignabilityCacheSize' | 'subtypeCacheSize' | 'identityCacheSize' | 'samplesTaken' | 'identifierCount' | 'completionsMean' | 'completionsMedian' | 'completionsStdDev' | 'quickInfoMean' | 'quickInfoMedian' | 'quickInfoStdDev' | 'completionsWorstMean' | 'quickInfoWorstMean';
export declare const metrics: {
    [K in MetricName]: Metric;
};
