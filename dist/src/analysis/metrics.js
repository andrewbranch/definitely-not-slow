"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../measure/utils");
const common_1 = require("../common");
function defaultGetSignificance(percentDiff) {
    if (percentDiff > common_1.config.comparison.percentDiffAlertThreshold) {
        return "alert" /* Alert */;
    }
    if (percentDiff > common_1.config.comparison.percentDiffWarningThreshold) {
        return "warning" /* Warning */;
    }
    if (percentDiff < common_1.config.comparison.percentDiffAwesomeThreshold) {
        return "awesome" /* Awesome */;
    }
}
const getInsignificant = () => undefined;
function getSignificanceProportionalTo(proportionalTo, getSignificance = defaultGetSignificance) {
    return (percentDiff, before, after) => {
        const proportionalToBeforeValue = exports.metrics[proportionalTo].getValue(before);
        const proportionalToAfterValue = exports.metrics[proportionalTo].getValue(after);
        if (typeof proportionalToBeforeValue === 'number' && typeof proportionalToAfterValue === 'number') {
            const proportionalToPercentDiff = common_1.getPercentDiff(proportionalToAfterValue, proportionalToBeforeValue);
            const defaultSignificance = getSignificance(percentDiff);
            const weightedSignificance = getSignificance(percentDiff - proportionalToPercentDiff);
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
function getOrderOfMagnitudeSignificance(percentDiff) {
    if (percentDiff > 10) { // decimal: 10 = 1000% = 10x increase
        return "alert" /* Alert */;
    }
    if (percentDiff > 5) {
        return "warning" /* Warning */;
    }
    if (percentDiff < -5) {
        return "awesome" /* Awesome */;
    }
}
exports.metrics = {
    typeCount: {
        columnName: 'Type count',
        sentenceName: 'type count',
        formatOptions: { precision: 0 },
        getValue: x => x.body.typeCount,
        getSignificance: getSignificanceProportionalTo('identifierCount', getOrderOfMagnitudeSignificance),
    },
    memoryUsage: {
        columnName: 'Memory usage (MiB)',
        sentenceName: 'memory usage',
        getValue: x => x.body.memoryUsage / Math.pow(2, 20),
        getSignificance: (percentDiff, before, after) => {
            if (common_1.supportsMemoryUsage(before) && common_1.supportsMemoryUsage(after)) {
                return getSignificanceProportionalTo('identifierCount', getOrderOfMagnitudeSignificance)(percentDiff, before, after);
            }
            return getInsignificant();
        }
    },
    assignabilityCacheSize: {
        columnName: 'Assignability cache size',
        sentenceName: 'assignability cache size',
        formatOptions: { precision: 0 },
        getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.assignable,
        getSignificance: getSignificanceProportionalTo('identifierCount', getOrderOfMagnitudeSignificance),
    },
    subtypeCacheSize: {
        columnName: 'Subtype cache size',
        sentenceName: 'subtype cache size',
        formatOptions: { precision: 0 },
        getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.subtype,
        getSignificance: getSignificanceProportionalTo('identifierCount', getOrderOfMagnitudeSignificance),
    },
    identityCacheSize: {
        columnName: 'Identity cache size',
        sentenceName: 'identity cache size',
        formatOptions: { precision: 0 },
        getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.identity,
        getSignificance: getSignificanceProportionalTo('identifierCount', getOrderOfMagnitudeSignificance),
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
    completionsAvgCV: {
        columnName: 'Mean CV',
        sentenceName: 'mean coefficient of variation of samples measured for completions time',
        getValue: x => x.body.completions.meanCoefficientOfVariation,
        getSignificance: getInsignificant,
        formatOptions: { percentage: true },
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
    quickInfoAvgCV: {
        columnName: 'Mean CV',
        sentenceName: 'mean coefficient of variation of samples measured for quick info time',
        getValue: x => x.body.quickInfo.meanCoefficientOfVariation,
        getSignificance: getInsignificant,
        formatOptions: { percentage: true },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hbmFseXNpcy9tZXRyaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNENBQXdDO0FBQ3hDLHNDQUEyRztBQTZDM0csU0FBUyxzQkFBc0IsQ0FBQyxXQUFtQjtJQUNqRCxJQUFJLFdBQVcsR0FBRyxlQUFNLENBQUMsVUFBVSxDQUFDLHlCQUF5QixFQUFFO1FBQzdELDJCQUErQjtLQUNoQztJQUNELElBQUksV0FBVyxHQUFHLGVBQU0sQ0FBQyxVQUFVLENBQUMsMkJBQTJCLEVBQUU7UUFDL0QsK0JBQWlDO0tBQ2xDO0lBQ0QsSUFBSSxXQUFXLEdBQUcsZUFBTSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsRUFBRTtRQUMvRCwrQkFBaUM7S0FDbEM7QUFDSCxDQUFDO0FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUM7QUFFekMsU0FBUyw2QkFBNkIsQ0FBQyxjQUEwQixFQUFFLGVBQWUsR0FBRyxzQkFBc0I7SUFDekcsT0FBTyxDQUFDLFdBQW1CLEVBQUUsTUFBeUMsRUFBRSxLQUF3QyxFQUFFLEVBQUU7UUFDbEgsTUFBTSx5QkFBeUIsR0FBRyxlQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNFLE1BQU0sd0JBQXdCLEdBQUcsZUFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6RSxJQUFJLE9BQU8seUJBQXlCLEtBQUssUUFBUSxJQUFJLE9BQU8sd0JBQXdCLEtBQUssUUFBUSxFQUFFO1lBQ2pHLE1BQU0seUJBQXlCLEdBQUcsdUJBQWMsQ0FBQyx3QkFBd0IsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3RHLE1BQU0sbUJBQW1CLEdBQUcsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sb0JBQW9CLEdBQUcsZUFB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