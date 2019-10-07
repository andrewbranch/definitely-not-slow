"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../measure/utils");
const common_1 = require("../common");
const util_1 = require("types-publisher/bin/util/util");
function getDefaultSignificance(percentDiff) {
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
const getInsignificant = () => undefined;
function proportionalTo(proportionalTo) {
    return (getSignificance) => (percentDiff, beforeValue, afterValue, beforeDoc, afterDoc) => {
        const proportionalToBeforeValue = exports.metrics[proportionalTo].getValue(beforeDoc);
        const proportionalToAfterValue = exports.metrics[proportionalTo].getValue(afterDoc);
        if (typeof proportionalToBeforeValue === 'number' && typeof proportionalToAfterValue === 'number') {
            const proportionalToPercentDiff = common_1.getPercentDiff(proportionalToAfterValue, proportionalToBeforeValue);
            const defaultSignificance = getSignificance(percentDiff, beforeValue, afterValue, beforeDoc, afterDoc);
            const weightedSignificance = getSignificance(percentDiff - proportionalToPercentDiff, beforeValue, afterValue, beforeDoc, afterDoc);
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
var FineIf;
(function (FineIf) {
    FineIf[FineIf["LessThan"] = -1] = "LessThan";
    FineIf[FineIf["GreaterThanOrEqualTo"] = 1] = "GreaterThanOrEqualTo";
})(FineIf || (FineIf = {}));
function withThreshold(fineIf, threshold) {
    return (getSignificance) => (percentDiff, beforeValue, afterValue, beforeDoc, afterDoc) => {
        const significance = getSignificance(percentDiff, beforeValue, afterValue, beforeDoc, afterDoc);
        if (afterValue * fineIf >= threshold * fineIf) {
            switch (significance) {
                case undefined:
                case "alert" /* Alert */:
                case "warning" /* Warning */:
                    return undefined;
                case "awesome" /* Awesome */:
                    return significance;
                default:
                    util_1.assertNever(significance);
            }
        }
        return significance;
    };
}
function ignoreIfEitherBenchmark(predicate) {
    return (getSignificance) => (percentDiff, beforeValue, afterValue, beforeDoc, afterDoc) => {
        if (predicate(beforeDoc) || predicate(afterDoc)) {
            return undefined;
        }
        return getSignificance(percentDiff, beforeValue, afterValue, beforeDoc, afterDoc);
    };
}
function compose(x, ...xs) {
    return getSignificance => {
        let current = x(getSignificance);
        while (x = xs.pop()) {
            current = x(current);
        }
        return current;
    };
}
exports.metrics = {
    typeCount: {
        columnName: 'Type count',
        sentenceName: 'type count',
        formatOptions: { precision: 0 },
        getValue: x => x.body.typeCount,
        getSignificance: compose(proportionalTo('identifierCount'), withThreshold(FineIf.LessThan, 5000))(getOrderOfMagnitudeSignificance),
    },
    memoryUsage: {
        columnName: 'Memory usage (MiB)',
        sentenceName: 'memory usage',
        getValue: x => x.body.memoryUsage / Math.pow(2, 20),
        getSignificance: compose(proportionalTo('identifierCount'), withThreshold(FineIf.LessThan, 65), ignoreIfEitherBenchmark(common_1.not(common_1.supportsMemoryUsage)))(getOrderOfMagnitudeSignificance),
    },
    assignabilityCacheSize: {
        columnName: 'Assignability cache size',
        sentenceName: 'assignability cache size',
        formatOptions: { precision: 0 },
        getValue: x => x.body.relationCacheSizes && x.body.relationCacheSizes.assignable,
        getSignificance: compose(proportionalTo('identifierCount'), withThreshold(FineIf.LessThan, 1000))(getOrderOfMagnitudeSignificance),
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
        getSignificance: withThreshold(FineIf.LessThan, 150)(getDefaultSignificance),
    },
    completionsStdDev: {
        columnName: 'Std. deviation (ms)',
        sentenceName: 'standard deviation of the durations for getting completions at a position',
        getValue: x => x.body.completions.standardDeviation,
        getSignificance: getInsignificant,
    },
    completionsAvgCV: {
        columnName: 'Mean [CV](https://en.wikipedia.org/wiki/Coefficient_of_variation)',
        sentenceName: 'mean coefficient of variation of samples measured for completions time',
        getValue: x => x.body.completions.meanCoefficientOfVariation,
        getSignificance: getInsignificant,
        formatOptions: { percentage: true, noDiff: true },
    },
    completionsWorstMean: {
        columnName: 'Worst duration (ms)',
        sentenceName: 'worst-case duration for getting completions at a position',
        getValue: x => utils_1.mean(x.body.completions.worst.completionsDurations),
        getSignificance: withThreshold(FineIf.LessThan, 200)(getDefaultSignificance),
    },
    quickInfoMean: {
        columnName: 'Mean duration (ms)',
        sentenceName: 'mean duration for getting quick info at a position',
        getValue: x => x.body.quickInfo.mean,
        getSignificance: withThreshold(FineIf.LessThan, 150)(getDefaultSignificance),
    },
    quickInfoStdDev: {
        columnName: 'Std. deviation (ms)',
        sentenceName: 'standard deviation of the durations for getting quick info at a position',
        getValue: x => x.body.quickInfo.standardDeviation,
        getSignificance: getInsignificant,
    },
    quickInfoAvgCV: {
        columnName: 'Mean [CV](https://en.wikipedia.org/wiki/Coefficient_of_variation)',
        sentenceName: 'mean coefficient of variation of samples measured for quick info time',
        getValue: x => x.body.quickInfo.meanCoefficientOfVariation,
        getSignificance: getInsignificant,
        formatOptions: { percentage: true },
    },
    quickInfoWorstMean: {
        columnName: 'Worst duration (ms)',
        sentenceName: 'worst-case duration for getting quick info at a position',
        getValue: x => utils_1.mean(x.body.quickInfo.worst.quickInfoDurations),
        getSignificance: withThreshold(FineIf.LessThan, 200)(getDefaultSignificance),
    },
};
function getInterestingMetrics(before, after) {
    return Object.values(exports.metrics).reduce((acc, metric) => {
        const beforeValue = metric.getValue(before);
        const afterValue = metric.getValue(after);
        const percentDiff = isNonNaNNumber(beforeValue) && isNonNaNNumber(afterValue) && common_1.getPercentDiff(afterValue, beforeValue);
        const significance = typeof percentDiff === 'number' && metric.getSignificance(percentDiff, beforeValue, afterValue, before, after);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hbmFseXNpcy9tZXRyaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNENBQXdDO0FBQ3hDLHNDQUFnSDtBQUNoSCx3REFBNEQ7QUFnRDVELFNBQVMsc0JBQXNCLENBQUMsV0FBbUI7SUFDakQsSUFBSSxXQUFXLEdBQUcsZUFBTSxDQUFDLFVBQVUsQ0FBQyx5QkFBeUIsRUFBRTtRQUM3RCwyQkFBK0I7S0FDaEM7SUFDRCxJQUFJLFdBQVcsR0FBRyxlQUFNLENBQUMsVUFBVSxDQUFDLDJCQUEyQixFQUFFO1FBQy9ELCtCQUFpQztLQUNsQztJQUNELElBQUksV0FBVyxHQUFHLGVBQU0sQ0FBQyxVQUFVLENBQUMsMkJBQTJCLEVBQUU7UUFDL0QsK0JBQWlDO0tBQ2xDO0FBQ0gsQ0FBQztBQUVELFNBQVMsK0JBQStCLENBQUMsV0FBbUI7SUFDMUQsSUFBSSxXQUFXLEdBQUcsRUFBRSxFQUFFLEVBQUUscUNBQXFDO1FBQzNELDJCQUErQjtLQUNoQztJQUNELElBQUksV0FBVyxHQUFHLENBQUMsRUFBRTtRQUNuQiwrQkFBaUM7S0FDbEM7SUFDRCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUNwQiwrQkFBaUM7S0FDbEM7QUFDSCxDQUFDO0FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUM7QUFFekMsU0FBUyxjQUFjLENBQUMsY0FBMEI7SUFDaEQsT0FBTyxDQUFDLGVBQWdDLEVBQW1CLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsRUFBRTtRQUMxSCxNQUFNLHlCQUF5QixHQUFHLGVBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDOUUsTUFBTSx3QkFBd0IsR0FBRyxlQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVFLElBQUksT0FBTyx5QkFBeUIsS0FBSyxRQUFRLElBQUksT0FBTyx3QkFBd0IsS0FBSyxRQUFRLEVBQUU7WUFDakcsTUFBTSx5QkFBeUIsR0FBRyx1QkFBYyxDQUFDLHdCQUF3QixFQUFFLHlCQUF5QixDQUFDLENBQUM7WUFDdEcsTUFBTSxtQkFBbUIsR0FBRyxlQUFlLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZHLE1BQU0sb0JBQW9CLEdBQUcsZUFBZSxDQUFDLFdBQVcsR0FBRyx5QkFBeUIsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNwSSxnR0FBZ0c7WUFDaEcsNkZBQTZGO1lBQzdGLGtFQUFrRTtZQUNsRSxJQUFJLG9CQUFvQiw0QkFBOEIsSUFBSSxtQkFBbUIsNEJBQThCLEVBQUU7Z0JBQzNHLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBQ0QsT0FBTyxvQkFBb0IsQ0FBQztTQUM3QjtJQUNILENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxJQUFLLE1BR0o7QUFIRCxXQUFLLE1BQU07SUFDVCw0Q0FBYSxDQUFBO0lBQ2IsbUVBQXdCLENBQUE7QUFDMUIsQ0FBQyxFQUhJLE1BQU0sS0FBTixNQUFNLFFBR1Y7QUFFRCxTQUFTLGFBQWEsQ0FBQyxNQUFjLEVBQUUsU0FBaUI7SUFDdEQsT0FBTyxDQUFDLGVBQWdDLEVBQW1CLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsRUFBRTtRQUMxSCxNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2hHLElBQUksVUFBVSxHQUFHLE1BQU0sSUFBSSxTQUFTLEdBQUcsTUFBTSxFQUFFO1lBQzdDLFFBQVEsWUFBWSxFQUFFO2dCQUNwQixLQUFLLFNBQVMsQ0FBQztnQkFDZix5QkFBNkI7Z0JBQzdCO29CQUNFLE9BQU8sU0FBUyxDQUFDO2dCQUNuQjtvQkFDRSxPQUFPLFlBQVksQ0FBQztnQkFDdEI7b0JBQ0Usa0JBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUM3QjtTQUNGO1FBQ0QsT0FBTyxZQUFZLENBQUM7SUFDdEIsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsdUJBQXVCLENBQUMsU0FBbUU7SUFDbEcsT0FBTyxDQUFDLGVBQWdDLEVBQW1CLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsRUFBRTtRQUMxSCxJQUFJLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDL0MsT0FBTyxTQUFTLENBQUM7U0FDbEI7UUFDRCxPQUFPLGVBQWUsQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDcEYsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLENBQXdCLEVBQUUsR0FBRyxFQUEyQjtJQUN2RSxPQUFPLGVBQWUsQ0FBQyxFQUFFO1FBQ3ZCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNqQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFHLEVBQUU7WUFDcEIsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN0QjtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFWSxRQUFBLE9BQU8sR0FBa0M7SUFDcEQsU0FBUyxFQUFFO1FBQ1QsVUFBVSxFQUFFLFlBQVk7UUFDeEIsWUFBWSxFQUFFLFlBQVk7UUFDMUIsYUFBYSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtRQUMvQixRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVM7UUFDL0IsZUFBZSxFQUFFLE9BQU8sQ0FDdEIsY0FBYyxDQUFDLGlCQUFpQixDQUFDLEVBQ2pDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUNyQyxDQUFDLCtCQUErQixDQUFDO0tBQ25DO0lBQ0QsV0FBVyxFQUFFO1FBQ1gsVUFBVSxFQUFFLG9CQUFvQjtRQUNoQyxZQUFZLEVBQUUsY0FBYztRQUM1QixRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFBLENBQUMsRUFBSSxFQUFFLENBQUE7UUFDM0MsZUFBZSxFQUFFLE9BQU8sQ0FDdEIsY0FBYyxDQUFDLGlCQUFpQixDQUFDLEVBQ2pDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUNsQyx1QkFBdUIsQ0FBQyxZQUFHLENBQUMsNEJBQW1CLENBQUMsQ0FBQyxDQUNsRCxDQUFDLCtCQUErQixDQUFDO0tBQ25DO0lBQ0Qsc0JBQXNCLEVBQUU7UUFDdEIsVUFBVSxFQUFFLDBCQUEwQjtRQUN0QyxZQUFZLEVBQUUsMEJBQTBCO1FBQ3hDLGFBQWEsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7UUFDL0IsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVU7UUFDaEYsZUFBZSxFQUFFLE9BQU8sQ0FDdEIsY0FBYyxDQUFDLGlCQUFpQixDQUFDLEVBQ2pDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUNyQyxDQUFDLCtCQUErQixDQUFDO0tBQ25DO0lBQ0QsWUFBWSxFQUFFO1FBQ1osVUFBVSxFQUFFLGVBQWU7UUFDM0IsWUFBWSxFQUFFLHlCQUF5QjtRQUN2QyxhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO1FBQy9CLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUMzRSxlQUFlLEVBQUUsZ0JBQWdCO0tBQ2xDO0lBQ0QsZUFBZSxFQUFFO1FBQ2YsVUFBVSxFQUFFLHNCQUFzQjtRQUNsQyxZQUFZLEVBQUUsNkNBQTZDO1FBQzNELGFBQWEsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7UUFDL0IsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUI7UUFDekMsZUFBZSxFQUFFLGdCQUFnQjtLQUNsQztJQUNELGVBQWUsRUFBRTtRQUNmLFVBQVUsRUFBRSxvQkFBb0I7UUFDaEMsWUFBWSxFQUFFLHFEQUFxRDtRQUNuRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJO1FBQ3RDLGVBQWUsRUFBRSxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQztLQUM3RTtJQUNELGlCQUFpQixFQUFFO1FBQ2pCLFVBQVUsRUFBRSxxQkFBcUI7UUFDakMsWUFBWSxFQUFFLDJFQUEyRTtRQUN6RixRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUI7UUFDbkQsZUFBZSxFQUFFLGdCQUFnQjtLQUNsQztJQUNELGdCQUFnQixFQUFFO1FBQ2hCLFVBQVUsRUFBRSxtRUFBbUU7UUFDL0UsWUFBWSxFQUFFLHdFQUF3RTtRQUN0RixRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQywwQkFBMEI7UUFDNUQsZUFBZSxFQUFFLGdCQUFnQjtRQUNqQyxhQUFhLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7S0FDbEQ7SUFDRCxvQkFBb0IsRUFBRTtRQUNwQixVQUFVLEVBQUUscUJBQXFCO1FBQ2pDLFlBQVksRUFBRSwyREFBMkQ7UUFDekUsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQztRQUNsRSxlQUFlLEVBQUUsYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsc0JBQXNCLENBQUM7S0FDN0U7SUFDRCxhQUFhLEVBQUU7UUFDYixVQUFVLEVBQUUsb0JBQW9CO1FBQ2hDLFlBQVksRUFBRSxvREFBb0Q7UUFDbEUsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSTtRQUNwQyxlQUFlLEVBQUUsYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsc0JBQXNCLENBQUM7S0FDN0U7SUFDRCxlQUFlLEVBQUU7UUFDZixVQUFVLEVBQUUscUJBQXFCO1FBQ2pDLFlBQVksRUFBRSwwRUFBMEU7UUFDeEYsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCO1FBQ2pELGVBQWUsRUFBRSxnQkFBZ0I7S0FDbEM7SUFDRCxjQUFjLEVBQUU7UUFDZCxVQUFVLEVBQUUsbUVBQW1FO1FBQy9FLFlBQVksRUFBRSx1RUFBdUU7UUFDckYsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsMEJBQTBCO1FBQzFELGVBQWUsRUFBRSxnQkFBZ0I7UUFDakMsYUFBYSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtLQUNwQztJQUNELGtCQUFrQixFQUFFO1FBQ2xCLFVBQVUsRUFBRSxxQkFBcUI7UUFDakMsWUFBWSxFQUFFLDBEQUEwRDtRQUN4RSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1FBQzlELGVBQWUsRUFBRSxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQztLQUM3RTtDQUNGLENBQUM7QUFRRixTQUFnQixxQkFBcUIsQ0FBQyxNQUF5QyxFQUFFLEtBQXdDO0lBQ3ZILE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxlQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUErRSxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQy9ILE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQyxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLHVCQUFjLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3pILE1BQU0sWUFBWSxHQUFHLE9BQU8sV0FBVyxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxXQUFZLEVBQUUsVUFBVyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0SSxJQUFJLFdBQVcsSUFBSSxZQUFZLEVBQUU7WUFDL0IsT0FBTztnQkFDTCxHQUFHLEdBQUc7Z0JBQ04sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRTthQUN0QyxDQUFDO1NBQ0g7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNULENBQUM7QUFkRCxzREFjQztBQUVELFNBQVMsY0FBYyxDQUFDLENBQU07SUFDNUIsT0FBTyxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUMsQ0FBQyJ9