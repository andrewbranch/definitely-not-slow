import { PackageBenchmarkSummary, Document } from '../common';
export interface Metric {
    columnName: string;
    sentenceName: string;
    isUninteresting?: boolean;
    higherIsBetter?: boolean;
    getValue: (x: Document<PackageBenchmarkSummary>) => number | undefined;
}
export declare type MetricName = 'typeCount' | 'assignabilityCacheSize' | 'subtypeCacheSize' | 'identityCacheSize' | 'samplesTaken' | 'identifierCount' | 'completionsMean' | 'completionsMedian' | 'completionsStdDev' | 'quickInfoMean' | 'quickInfoMedian' | 'quickInfoStdDev' | 'completionsWorstMean' | 'quickInfoWorstMean';
export declare const metrics: {
    [K in MetricName]: Metric;
};
