"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../measure/utils");
const common_1 = require("../common");
function defaultGetSignificance(percentDiff) {
    if (percentDiff > common_1.config.comparison.percentDiffSevereThreshold) {
        return "warning" /* Warning */;
    }
    if (percentDiff > common_1.config.comparison.percentDiffWarningThreshold) {
        return "alert" /* Alert */;
    }
    if (percentDiff < common_1.config.comparison.percentDiffGoldStarThreshold) {
        return "awesome" /* Awesome */;
    }
}
const getInsignificant = () => undefined;
exports.metrics = {
    typeCount: {
        columnName: 'Type count',
        sentenceName: 'type count',
        formatOptions: { precision: 0 },
        getValue: x => x.body.typeCount,
        getSignificance: defaultGetSignificance,
    },
    assignabilityCacheSize: {
        columnName: 'Assignability cache size',
        sentenceName: 'assignability cache size',
        formatOptions: { precision: 0 },
        getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.assignable,
        getSignificance: defaultGetSignificance,
    },
    subtypeCacheSize: {
        columnName: 'Subtype cache size',
        sentenceName: 'subtype cache size',
        formatOptions: { precision: 0 },
        getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.subtype,
        getSignificance: defaultGetSignificance,
    },
    identityCacheSize: {
        columnName: 'Identity cache size',
        sentenceName: 'identity cache size',
        formatOptions: { precision: 0 },
        getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.identity,
        getSignificance: defaultGetSignificance,
    },
    samplesTaken: {
        columnName: 'Samples taken',
        sentenceName: 'number of samples taken',
        formatOptions: { precision: 0 },
        getValue: x => Math.max(x.body.completions.trials, x.body.quickInfo.trials),
        getSignificance: getInsignificant,
    },
    identifierCount: {
        columnName: 'Identifiers in tests',
        sentenceName: 'number of identifiers present in test files',
        formatOptions: { precision: 0 },
        getValue: x => x.body.testIdentifierCount,
        getSignificance: getInsignificant,
    },
    completionsMean: {
        columnName: 'Mean duration (ms)',
        sentenceName: 'mean duration for getting completions at a position',
        getValue: x => x.body.completions.mean,
        getSignificance: defaultGetSignificance,
    },
    completionsMedian: {
        columnName: 'Median duration (ms)',
        sentenceName: 'median duration for getting completions at a position',
        getValue: x => x.body.completions.median,
        getSignificance: defaultGetSignificance,
    },
    completionsStdDev: {
        columnName: 'Std. deviation (ms)',
        sentenceName: 'standard deviation of the durations for getting completions at a position',
        getValue: x => x.body.completions.standardDeviation,
        getSignificance: getInsignificant,
    },
    completionsWorstMean: {
        columnName: 'Worst duration (ms)',
        sentenceName: 'worst-case duration for getting completions at a position',
        getValue: x => utils_1.mean(x.body.completions.worst.completionsDurations),
        getSignificance: defaultGetSignificance,
    },
    quickInfoMean: {
        columnName: 'Mean duration (ms)',
        sentenceName: 'mean duration for getting quick info at a position',
        getValue: x => x.body.quickInfo.mean,
        getSignificance: defaultGetSignificance,
    },
    quickInfoMedian: {
        columnName: 'Median duration (ms)',
        sentenceName: 'median duration for getting quick info at a position',
        getValue: x => x.body.quickInfo.median,
        getSignificance: defaultGetSignificance,
    },
    quickInfoStdDev: {
        columnName: 'Std. deviation (ms)',
        sentenceName: 'standard deviation of the durations for getting quick info at a position',
        getValue: x => x.body.quickInfo.standardDeviation,
        getSignificance: getInsignificant,
    },
    quickInfoWorstMean: {
        columnName: 'Worst duration (ms)',
        sentenceName: 'worst-case duration for getting quick info at a position',
        getValue: x => utils_1.mean(x.body.quickInfo.worst.quickInfoDurations),
        getSignificance: defaultGetSignificance,
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvbWV0cmljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDRDQUF3QztBQUN4QyxzQ0FBc0U7QUEwQ3RFLFNBQVMsc0JBQXNCLENBQUMsV0FBbUI7SUFDakQsSUFBSSxXQUFXLEdBQUcsZUFBTSxDQUFDLFVBQVUsQ0FBQywwQkFBMEIsRUFBRTtRQUM5RCwrQkFBaUM7S0FDbEM7SUFDRCxJQUFJLFdBQVcsR0FBRyxlQUFNLENBQUMsVUFBVSxDQUFDLDJCQUEyQixFQUFFO1FBQy9ELDJCQUErQjtLQUNoQztJQUNELElBQUksV0FBVyxHQUFHLGVBQU0sQ0FBQyxVQUFVLENBQUMsNEJBQTRCLEVBQUU7UUFDaEUsK0JBQWlDO0tBQ2xDO0FBQ0gsQ0FBQztBQUVELE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO0FBRTVCLFFBQUEsT0FBTyxHQUFrQztJQUNwRCxTQUFTLEVBQUU7UUFDVCxVQUFVLEVBQUUsWUFBWTtRQUN4QixZQUFZLEVBQUUsWUFBWTtRQUMxQixhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO1FBQy9CLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUztRQUMvQixlQUFlLEVBQUUsc0JBQXNCO0tBQ3hDO0lBQ0Qsc0JBQXNCLEVBQUU7UUFDdEIsVUFBVSxFQUFFLDBCQUEwQjtRQUN0QyxZQUFZLEVBQUUsMEJBQTBCO1FBQ3hDLGFBQWEsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7UUFDL0IsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVU7UUFDaEYsZUFBZSxFQUFFLHNCQUFzQjtLQUN4QztJQUNELGdC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