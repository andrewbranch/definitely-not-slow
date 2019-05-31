"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../measure/utils");
exports.metrics = {
    typeCount: {
        columnName: 'Type count',
        sentenceName: 'type count',
        formatOptions: { precision: 0 },
        getValue: x => x.body.typeCount,
    },
    // memoryUsage: {
    //   columnName: 'Memory usage',
    //   sentenceName: 'memory usage',
    //   getValue: x => x.body.memoryUsage,
    // },
    assignabilityCacheSize: {
        columnName: 'Assignability cache size',
        sentenceName: 'assignability cache size',
        formatOptions: { precision: 0 },
        getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.assignable,
    },
    subtypeCacheSize: {
        columnName: 'Subtype cache size',
        sentenceName: 'subtype cache size',
        formatOptions: { precision: 0 },
        getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.subtype,
    },
    identityCacheSize: {
        columnName: 'Identity cache size',
        sentenceName: 'identity cache size',
        formatOptions: { precision: 0 },
        getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.identity,
    },
    samplesTaken: {
        columnName: 'Samples taken',
        sentenceName: 'number of samples taken',
        formatOptions: { precision: 0 },
        isUninteresting: true,
        higherIsBetter: true,
        getValue: x => Math.max(x.body.completions.trials, x.body.quickInfo.trials),
    },
    identifierCount: {
        columnName: 'Identifiers in tests',
        sentenceName: 'number of identifiers present in test files',
        formatOptions: { precision: 0 },
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
        getValue: x => utils_1.mean(x.body.completions.worst.completionsDurations),
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
        getValue: x => utils_1.mean(x.body.completions.worst.completionsDurations),
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvbWV0cmljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDRDQUF3QztBQW9DM0IsUUFBQSxPQUFPLEdBQWtDO0lBQ3BELFNBQVMsRUFBRTtRQUNULFVBQVUsRUFBRSxZQUFZO1FBQ3hCLFlBQVksRUFBRSxZQUFZO1FBQzFCLGFBQWEsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7UUFDL0IsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTO0tBQ2hDO0lBQ0QsaUJBQWlCO0lBQ2pCLGdDQUFnQztJQUNoQyxrQ0FBa0M7SUFDbEMsdUNBQXVDO0lBQ3ZDLEtBQUs7SUFDTCxzQkFBc0IsRUFBRTtRQUN0QixVQUFVLEVBQUUsMEJBQTBCO1FBQ3RDLFlBQVksRUFBRSwwQkFBMEI7UUFDeEMsYUFBYSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtRQUMvQixRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVTtLQUNqRjtJQUNELGdCQUFnQixFQUFFO1FBQ2hCLFVBQVUsRUFBRSxvQkFBb0I7UUFDaEMsWUFBWSxFQUFFLG9CQUFvQjtRQUNsQyxhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO1FBQy9CLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPO0tBQzlFO0lBQ0QsaUJBQWlCLEVBQUU7UUFDakIsVUFBVSxFQUFFLHFCQUFxQjtRQUNqQyxZQUFZLEVBQUUscUJBQXFCO1FBQ25DLGFBQWEsRUFBRSxFQUFFLFNBQVMs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