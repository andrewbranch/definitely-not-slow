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
        columnName: 'Memory usage',
        sentenceName: 'memory usage',
        getValue: x => x.body.memoryUsage,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hbmFseXNpcy9tZXRyaWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNENBQXdDO0FBQ3hDLHNDQUEyRztBQTZDM0csU0FBUyxzQkFBc0IsQ0FBQyxXQUFtQjtJQUNqRCxJQUFJLFdBQVcsR0FBRyxlQUFNLENBQUMsVUFBVSxDQUFDLHlCQUF5QixFQUFFO1FBQzdELDJCQUErQjtLQUNoQztJQUNELElBQUksV0FBVyxHQUFHLGVBQU0sQ0FBQyxVQUFVLENBQUMsMkJBQTJCLEVBQUU7UUFDL0QsK0JBQWlDO0tBQ2xDO0lBQ0QsSUFBSSxXQUFXLEdBQUcsZUFBTSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsRUFBRTtRQUMvRCwrQkFBaUM7S0FDbEM7QUFDSCxDQUFDO0FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUM7QUFFekMsU0FBUyw2QkFBNkIsQ0FBQyxjQUEwQixFQUFFLGVBQWUsR0FBRyxzQkFBc0I7SUFDekcsT0FBTyxDQUFDLFdBQW1CLEVBQUUsTUFBeUMsRUFBRSxLQUF3QyxFQUFFLEVBQUU7UUFDbEgsTUFBTSx5QkFBeUIsR0FBRyxlQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNFLE1BQU0sd0JBQXdCLEdBQUcsZUFBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6RSxJQUFJLE9BQU8seUJBQXlCLEtBQUssUUFBUSxJQUFJLE9BQU8sd0JBQXdCLEtBQUssUUFBUSxFQUFFO1lBQ2pHLE1BQU0seUJBQXlCLEdBQUcsdUJBQWMsQ0FBQyx3QkFBd0IsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3RHLE1BQU0sbUJBQW1CLEdBQUcsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sb0JBQW9CLEdBQUcsZUFBZSxDQUFDLFdBQVcsR0FBRyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3RGLGdHQUFnRztZQUNoRyw2RkFBNkY7WUFDN0Ysa0VBQWtFO1lBQ2xFLElBQUksb0JBQW9CLDRCQUE4QixJQUFJLG1CQUFtQiw0QkFBOEIsRUFBRTtnQkFDM0csT0FBTyxTQUFTLENBQUM7YUFDbEI7WUFDRCxPQUFPLG9CQUFvQixDQUFDO1NBQzdCO0lBQ0gsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsK0JBQStCLENBQUMsV0FBbUI7SUFDMUQsSUFBSSxXQUFXLEdBQUcsRUFBRSxFQUFFLEVBQUUscUNBQXFDO1FBQzNELDJCQUErQjtLQUNoQztJQUNELElBQUksV0FBVyxHQUFHLENBQUMsRUFBRTtRQUNuQiwrQkFBaUM7S0FDbEM7SUFDRCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUNwQiwrQkFBaUM7S0FDbEM7QUFDSCxDQUFDO0FBRVksUUFBQSxPQUFPLEdBQWtDO0lBQ3BELFNBQVMsRUFBRTtRQUNULFVBQVUsRUFBRSxZQUFZO1FBQ3hCLFlBQVksRUFBRSxZQUFZO1FBQzFCLGFBQWEsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7UUFDL0IsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTO1FBQy9CLGVBQWUsRUFBRSw2QkFBNkIsQ0FBQyxpQkFBaUIsRUFBRSwrQkFBK0IsQ0FBQztLQUNuRztJQUNELFdBQVcsRUFBRTtRQUNYLFVBQVUsRUFBRSxjQUFjO1FBQzFCLFlBQVksRUFBRSxjQUFjO1FBQzVCLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVztRQUNqQyxlQUFlLEVBQUUsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQzlDLElBQUksNEJBQW1CLENBQUMsTUFBTSxDQUFDLElBQUksNEJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzdELE9BQU8sNkJBQTZCLENBQUMsaUJBQWlCLEVBQUUsK0JBQStCLENBQUMsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3RIO1lBQ0QsT0FBTyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzVCLENBQUM7S0FDRjtJQUNELHNCQUFzQixFQUFFO1FBQ3RCLFVBQVUsRUFBRSwwQkFBMEI7UUFDdEMsWUFBWSxFQUFFLDBCQUEwQjtRQUN4QyxhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO1FBQy9CLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVO1FBQ2hGLGVBQWUsRUFBRSw2QkFBNkIsQ0FBQyxpQkFBaUIsRUFBRSwrQkFBK0IsQ0FBQztLQUNuRztJQUNELGdCQUFnQixFQUFFO1FBQ2hCLFVBQVUsRUFBRSxvQkFBb0I7UUFDaEMsWUFBWSxFQUFFLG9CQUFvQjtRQUNsQyxhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO1FBQy9CLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPO1FBQzdFLGVBQWUsRUFBRSw2QkFBNkIsQ0FBQyxpQkFBaUIsRUFBRSwrQkFBK0IsQ0FBQztLQUNuRztJQUNELGlCQUFpQixFQUFFO1FBQ2pCLFVBQVUsRUFBRSxxQkFBcUI7UUFDakMsWUFBWSxFQUFFLHFCQUFxQjtRQUNuQyxhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO1FBQy9CLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRO1FBQzlFLGVBQWUsRUFBRSw2QkFBNkIsQ0FBQyxpQkFBaUIsRUFBRSwrQkFBK0IsQ0FBQztLQUNuRztJQUNELFlBQVksRUFBRTtRQUNaLFVBQVUsRUFBRSxlQUFlO1FBQzNCLFlBQVksRUFBRSx5QkFBeUI7UUFDdkMsYUFBYSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtRQUMvQixRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDM0UsZUFBZSxFQUFFLGdCQUFnQjtLQUNsQztJQUNELGVBQWUsRUFBRTtRQUNmLFVBQVUsRUFBRSxzQkFBc0I7UUFDbEMsWUFBWSxFQUFFLDZDQUE2QztRQUMzRCxhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO1FBQy9CLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CO1FBQ3pDLGVBQWUsRUFBRSxnQkFBZ0I7S0FDbEM7SUFDRCxlQUFlLEVBQUU7UUFDZixVQUFVLEVBQUUsb0JBQW9CO1FBQ2hDLFlBQVksRUFBRSxxREFBcUQ7UUFDbkUsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSTtRQUN0QyxlQUFlLEVBQUUsc0JBQXNCO0tBQ3hDO0lBQ0QsaUJBQWlCLEVBQUU7UUFDakIsVUFBVSxFQUFFLHNCQUFzQjtRQUNsQyxZQUFZLEVBQUUsdURBQXVEO1FBQ3JFLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU07UUFDeEMsZUFBZSxFQUFFLHNCQUFzQjtLQUN4QztJQUNELGlCQUFpQixFQUFFO1FBQ2pCLFVBQVUsRUFBRSxxQkFBcUI7UUFDakMsWUFBWSxFQUFFLDJFQUEyRTtRQUN6RixRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUI7UUFDbkQsZUFBZSxFQUFFLGdCQUFnQjtLQUNsQztJQUNELGdCQUFnQixFQUFFO1FBQ2hCLFVBQVUsRUFBRSxTQUFTO1FBQ3JCLFlBQVksRUFBRSx3RUFBd0U7UUFDdEYsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsMEJBQTBCO1FBQzVELGVBQWUsRUFBRSxnQkFBZ0I7UUFDakMsYUFBYSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtLQUNwQztJQUNELG9CQUFvQixFQUFFO1FBQ3BCLFVBQVUsRUFBRSxxQkFBcUI7UUFDakMsWUFBWSxFQUFFLDJEQUEyRDtRQUN6RSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDO1FBQ2xFLGVBQWUsRUFBRSxzQkFBc0I7S0FDeEM7SUFDRCxhQUFhLEVBQUU7UUFDYixVQUFVLEVBQUUsb0JBQW9CO1FBQ2hDLFlBQVksRUFBRSxvREFBb0Q7UUFDbEUsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSTtRQUNwQyxlQUFlLEVBQUUsc0JBQXNCO0tBQ3hDO0lBQ0QsZUFBZSxFQUFFO1FBQ2YsVUFBVSxFQUFFLHNCQUFzQjtRQUNsQyxZQUFZLEVBQUUsc0RBQXNEO1FBQ3BFLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU07UUFDdEMsZUFBZSxFQUFFLHNCQUFzQjtLQUN4QztJQUNELGVBQWUsRUFBRTtRQUNmLFVBQVUsRUFBRSxxQkFBcUI7UUFDakMsWUFBWSxFQUFFLDBFQUEwRTtRQUN4RixRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUI7UUFDakQsZUFBZSxFQUFFLGdCQUFnQjtLQUNsQztJQUNELGNBQWMsRUFBRTtRQUNkLFVBQVUsRUFBRSxTQUFTO1FBQ3JCLFlBQVksRUFBRSx1RUFBdUU7UUFDckYsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsMEJBQTBCO1FBQzFELGVBQWUsRUFBRSxnQkFBZ0I7UUFDakMsYUFBYSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtLQUNwQztJQUNELGtCQUFrQixFQUFFO1FBQ2xCLFVBQVUsRUFBRSxxQkFBcUI7UUFDakMsWUFBWSxFQUFFLDBEQUEwRDtRQUN4RSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDO1FBQzlELGVBQWUsRUFBRSxzQkFBc0I7S0FDeEM7Q0FDRixDQUFDO0FBUUYsU0FBZ0IscUJBQXFCLENBQUMsTUFBeUMsRUFBRSxLQUF3QztJQUN2SCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBTyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBK0UsRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUMvSCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSx1QkFBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN2RyxNQUFNLFlBQVksR0FBRyxPQUFPLFdBQVcsS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzNHLElBQUksV0FBVyxJQUFJLFlBQVksRUFBRTtZQUMvQixPQUFPO2dCQUNMLEdBQUcsR0FBRztnQkFDTixFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFO2FBQ3RDLENBQUM7U0FDSDtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ1QsQ0FBQztBQWRELHNEQWNDO0FBRUQsU0FBUyxjQUFjLENBQUMsQ0FBTTtJQUM1QixPQUFPLE9BQU8sQ0FBQyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QyxDQUFDIn0=