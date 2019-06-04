"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../measure/utils");
const common_1 = require("../common");
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
            const defaultSignificance = defaultGetSignificance(percentDiff);
            const weightedSignificance = defaultGetSignificance(percentDiff - proportionalToPercentDiff);
            // Can’t give out a gold star unless it’s absolutely better, otherwise it looks really confusing
            // when type count increased by 400% and that gets treated as “awesome” when identifier count
            // increased by 500%. It may _be_ awesome, but it looks confusing.
            if (weightedSignificance === "awesome" /* Awesome */ && defaultSignificance !== "awesome" /* Awesome */) {
                return undefined;
            }
            return weightedSignificance;
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
    memoryUsage: {
        columnName: 'Memory usage',
        sentenceName: 'memory usage',
        getValue: x => x.body.memoryUsage,
        getSignificance: (percentDiff, before, after) => {
            if (common_1.supportsMemoryUsage(before) && common_1.supportsMemoryUsage(after)) {
                return getSignificanceProportionalTo('identifierCount')(percentDiff, before, after);
            }
            return getInsignificant();
        }
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
        const percentDiff = isNonNaNNumber(aValue) && isNonNaNNumber(bValue) && common_1.getPercentDiff(bValue, aValue);
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
function isNonNaNNumber(n) {
    return typeof n === 'number' && !isNaN(n);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hbmFseXNpcy9tZXRyaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNENBQXdDO0FBQ3hDLHNDQUEyRztBQTBDM0csU0FBUyxzQkFBc0IsQ0FBQyxXQUFtQjtJQUNqRCxJQUFJLFdBQVcsR0FBRyxlQUFNLENBQUMsVUFBVSxDQUFDLDBCQUEwQixFQUFFO1FBQzlELDJCQUErQjtLQUNoQztJQUNELElBQUksV0FBVyxHQUFHLGVBQU0sQ0FBQyxVQUFVLENBQUMsMkJBQTJCLEVBQUU7UUFDL0QsK0JBQWlDO0tBQ2xDO0lBQ0QsSUFBSSxXQUFXLEdBQUcsZUFBTSxDQUFDLFVBQVUsQ0FBQyw0QkFBNEIsRUFBRTtRQUNoRSwrQkFBaUM7S0FDbEM7QUFDSCxDQUFDO0FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUM7QUFFekMsU0FBUyw2QkFBNkIsQ0FBQyxjQUEwQjtJQUMvRCxPQUFPLENBQUMsV0FBbUIsRUFBRSxNQUF5QyxFQUFFLEtBQXdDLEVBQUUsRUFBRTtRQUNsSCxNQUFNLHlCQUF5QixHQUFHLGVBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0UsTUFBTSx3QkFBd0IsR0FBRyxlQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pFLElBQUksT0FBTyx5QkFBeUIsS0FBSyxRQUFRLElBQUksT0FBTyx3QkFBd0IsS0FBSyxRQUFRLEVBQUU7WUFDakcsTUFBTSx5QkFBeUIsR0FBRyx1QkFBYyxDQUFDLHdCQUF3QixFQUFFLHlCQUF5QixDQUFDLENBQUM7WUFDdEcsTUFBTSxtQkFBbUIsR0FBRyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNoRSxNQUFNLG9CQUFvQixHQUFHLHNCQUFzQixDQUFDLFdBQVcsR0FBRyx5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