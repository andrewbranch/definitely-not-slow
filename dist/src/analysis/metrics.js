"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../measure/utils");
const common_1 = require("../common");
const util_1 = require("util");
function defaultGetSignificance(percentDiff) {
    if (percentDiff > common_1.config.comparison.percentDiffSevereThreshold) {
        return "alert" /* Alert */;
    }
    if (percentDiff > common_1.config.comparison.percentDiffWarningThreshold) {
        return "warning" /* Warning */;
    }
    if (percentDiff < common_1.config.comparison.percentDiffGoldStarThreshold) {
        return "awesome" /* Awesome */;
    }
}
const getInsignificant = () => undefined;
function getSignificanceProportionalTo(proportionalTo) {
    return (percentDiff, before, after) => {
        const proportionalToBeforeValue = exports.metrics[proportionalTo].getValue(before);
        const proportionalToAfterValue = exports.metrics[proportionalTo].getValue(after);
        if (typeof proportionalToBeforeValue === 'number' && typeof proportionalToAfterValue === 'number') {
            const proportionalToPercentDiff = common_1.getPercentDiff(proportionalToAfterValue, proportionalToBeforeValue);
            return defaultGetSignificance(percentDiff - proportionalToPercentDiff);
        }
    };
}
exports.metrics = {
    typeCount: {
        columnName: 'Type count',
        sentenceName: 'type count',
        formatOptions: { precision: 0 },
        getValue: x => x.body.typeCount,
        getSignificance: getSignificanceProportionalTo('identifierCount'),
    },
    assignabilityCacheSize: {
        columnName: 'Assignability cache size',
        sentenceName: 'assignability cache size',
        formatOptions: { precision: 0 },
        getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.assignable,
        getSignificance: getSignificanceProportionalTo('identifierCount'),
    },
    subtypeCacheSize: {
        columnName: 'Subtype cache size',
        sentenceName: 'subtype cache size',
        formatOptions: { precision: 0 },
        getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.subtype,
        getSignificance: getSignificanceProportionalTo('identifierCount'),
    },
    identityCacheSize: {
        columnName: 'Identity cache size',
        sentenceName: 'identity cache size',
        formatOptions: { precision: 0 },
        getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.identity,
        getSignificance: getSignificanceProportionalTo('identifierCount'),
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
function getInterestingMetrics(before, after) {
    return Object.values(exports.metrics).reduce((acc, metric) => {
        const aValue = metric.getValue(before);
        const bValue = metric.getValue(after);
        const percentDiff = util_1.isNumber(aValue) && util_1.isNumber(bValue) && common_1.getPercentDiff(bValue, aValue);
        const significance = typeof percentDiff === 'number' && metric.getSignificance(percentDiff, before, after);
        if (percentDiff && significance) {
            return [
                ...acc,
                { metric, percentDiff, significance },
            ];
        }
        return acc;
    }, []);
}
exports.getInterestingMetrics = getInterestingMetrics;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hbmFseXNpcy9tZXRyaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNENBQXdDO0FBQ3hDLHNDQUFzRjtBQUN0RiwrQkFBZ0M7QUEwQ2hDLFNBQVMsc0JBQXNCLENBQUMsV0FBbUI7SUFDakQsSUFBSSxXQUFXLEdBQUcsZUFBTSxDQUFDLFVBQVUsQ0FBQywwQkFBMEIsRUFBRTtRQUM5RCwyQkFBK0I7S0FDaEM7SUFDRCxJQUFJLFdBQVcsR0FBRyxlQUFNLENBQUMsVUFBVSxDQUFDLDJCQUEyQixFQUFFO1FBQy9ELCtCQUFpQztLQUNsQztJQUNELElBQUksV0FBVyxHQUFHLGVBQU0sQ0FBQyxVQUFVLENBQUMsNEJBQTRCLEVBQUU7UUFDaEUsK0JBQWlDO0tBQ2xDO0FBQ0gsQ0FBQztBQUVELE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDO0FBRXpDLFNBQVMsNkJBQTZCLENBQUMsY0FBMEI7SUFDL0QsT0FBTyxDQUFDLFdBQW1CLEVBQUUsTUFBeUMsRUFBRSxLQUF3QyxFQUFFLEVBQUU7UUFDbEgsTUFBTSx5QkFBeUIsR0FBRyxlQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNFLE1BQU0sd0JBQXdCLEdBQUcsZUFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6RSxJQUFJLE9BQU8seUJBQXlCLEtBQUssUUFBUSxJQUFJLE9BQU8sd0JBQXdCLEtBQUssUUFBUSxFQUFFO1lBQ2pHLE1BQU0seUJBQXlCLEdBQUcsdUJBQWMsQ0FBQyx3QkFBd0IsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3RHLE9BQU8sc0JBQXNCLENBQUMsV0FBVyxHQUFHLHlCQUF5QixDQUFDLENBQUM7U0FDeEU7SUFDSCxDQUFDLENBQUM7QUFDSixDQUFDO0FB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