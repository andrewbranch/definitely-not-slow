import { mean } from '../measure/utils';
import { PackageBenchmarkSummary, Document } from '../common';

export interface Metric {
  columnName: string;
  sentenceName: string;
  isUninteresting?: boolean;
  higherIsBetter?: boolean;
  getValue: (x: Document<PackageBenchmarkSummary>) => number | undefined;
}

export type MetricName =
  | 'typeCount'
  | 'assignabilityCacheSize'
  | 'subtypeCacheSize'
  | 'identityCacheSize'
  | 'samplesTaken'
  | 'identifierCount'
  | 'completionsMean'
  | 'completionsMedian'
  | 'completionsStdDev'
  | 'quickInfoMean'
  | 'quickInfoMedian'
  | 'quickInfoStdDev'
  | 'completionsWorstMean'
  | 'quickInfoWorstMean';


export const metrics: { [K in MetricName]: Metric } = {
  typeCount: {
    columnName: 'Type count',
    sentenceName: 'type count',
    getValue: x => x.body.typeCount,
  },
  assignabilityCacheSize: {
    columnName: 'Assignability cache size',
    sentenceName: 'assignability cache size',
    getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.assignable,
  },
  subtypeCacheSize: {
    columnName: 'Subtype cache size',
    sentenceName: 'subtype cache size',
    getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.subtype,
  },
  identityCacheSize: {
    columnName: 'Identity cache size',
    sentenceName: 'identity cache size',
    getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.identity,
  },
  samplesTaken: {
    columnName: 'Samples taken',
    sentenceName: 'number of samples taken',
    isUninteresting: true,
    higherIsBetter: true,
    getValue: x => Math.max(x.body.completions.trials, x.body.quickInfo.trials),
  },
  identifierCount: {
    columnName: 'Identifiers in tests',
    sentenceName: 'number of identifiers present in test files',
    isUninteresting: true,
    higherIsBetter: true,
    getValue: x => x.body.testIdentifierCount,
  },
  completionsMean: {
    columnName: 'Mean duration (ms)',
    sentenceName: 'mean duration for getting completions at a position',
    getValue: x => x.body.completions.mean,
  },
  completionsMedian: {
    columnName: 'Median duration (ms)',
    sentenceName: 'median duration for getting completions at a position',
    getValue: x => x.body.completions.median,
  },
  completionsStdDev: {
    columnName: 'Std. deviation (ms)',
    sentenceName: 'standard deviation of the durations for getting completions at a position',
    getValue: x => x.body.completions.standardDeviation,
  },
  completionsWorstMean: {
    columnName: 'Worst completions duration (ms)',
    sentenceName: 'worst-case duration for getting completions at a position',
    getValue: x => mean(x.body.completions.worst.completionsDurations),
  },
  quickInfoMean: {
    columnName: 'Mean duration (ms)',
    sentenceName: 'mean duration for getting quick info at a position',
    getValue: x => x.body.quickInfo.mean,
  },
  quickInfoMedian: {
    columnName: 'Median duration (ms)',
    sentenceName: 'median duration for getting quick info at a position',
    getValue: x => x.body.quickInfo.median,
  },
  quickInfoStdDev: {
    columnName: 'Std. deviation (ms)',
    sentenceName: 'standard deviation of the durations for getting quick info at a position',
    getValue: x => x.body.quickInfo.standardDeviation,
  },
  quickInfoWorstMean: {
    columnName: 'Worst completions duration (ms)',
    sentenceName: 'worst-case duration for getting completions at a position',
    getValue: x => mean(x.body.completions.worst.completionsDurations),
  },
};