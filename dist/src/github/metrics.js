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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvbWV0cmljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDRDQUF3QztBQWtDM0IsUUFBQSxPQUFPLEdBQWtDO0lBQ3BELFNBQVMsRUFBRTtRQUNULFVBQVUsRUFBRSxZQUFZO1FBQ3hCLFlBQVksRUFBRSxZQUFZO1FBQzFCLGFBQWEsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7UUFDL0IsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTO0tBQ2hDO0lBQ0Qsc0JBQXNCLEVBQUU7UUFDdEIsVUFBVSxFQUFFLDBCQUEwQjtRQUN0QyxZQUFZLEVBQUUsMEJBQTBCO1FBQ3hDLGFBQWEsRUFBRSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUU7UUFDL0IsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVU7S0FDakY7SUFDRCxnQkFBZ0IsRUFBRTtRQUNoQixVQUFVLEVBQUUsb0JBQW9CO1FBQ2hDLFlBQVksRUFBRSxvQkFBb0I7UUFDbEMsYUFBYSxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRTtRQUMvQixRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTztLQUM5RTtJQUNELGlCQUFpQixFQUFFO1FBQ2pCLFVBQVUsRUFBRSxxQkFBcUI7UUFDakMsWUFBWSxFQUFFLHFCQUFxQjtRQUNuQyxhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO1FBQy9CLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRO0tBQy9FO0lBQ0QsWUFBWSxFQUFFO1FBQ1osVUFBVSxFQUFFLGVBQWU7UUFDM0IsWUFBWSxFQUFFLHlCQUF5QjtRQUN2QyxhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO1FBQy9CLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLGNBQWMsRUFBRSxJQUFJO1FBQ3BCLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztLQUM1RTtJQUNELGVBQWUsRUFBRTtRQUNmLFVBQVUsRUFBRSxzQkFBc0I7UUFDbEMsWUFBWSxFQUFFLDZDQUE2QztRQUMzRCxhQUFhLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFO1FBQy9CLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLGNBQWMsRUFBRSxJQUFJO1FBQ3BCLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CO0tBQzFDO0lBQ0QsZUFBZSxFQUFFO1FBQ2YsVUFBVSxFQUFFLG9CQUFvQjtRQUNoQyxZQUFZLEVBQUUscURBQXFEO1FBQ25FLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUk7S0FDdkM7SUFDRCxpQkFBaUIsRUFBRTtRQUNqQixVQUFVLEVBQUUsc0JBQXNCO1FBQ2xDLFlBQVksRUFBRSx1REFBdUQ7UUFDckUsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTTtLQUN6QztJQUNELGlCQUFpQixFQUFFO1FBQ2pCLFVBQVUsRUFBRSxxQkFBcUI7UUFDakMsWUFBWSxFQUFFLDJFQUEyRTtRQUN6RixRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUI7S0FDcEQ7SUFDRCxvQkFBb0IsRUFBRTtRQUNwQixVQUFVLEVBQUUsaUNBQWlDO1FBQzdDLFlBQVksRUFBRSwyREFBMkQ7UUFDekUsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQztLQUNuRTtJQUNELGFBQWEsRUFBRTtRQUNiLFVBQVUsRUFBRSxvQkFBb0I7UUFDaEMsWUFBWSxFQUFFLG9EQUFvRDtRQUNsRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJO0tBQ3JDO0lBQ0QsZUFBZSxFQUFFO1FBQ2YsVUFBVSxFQUFFLHNCQUFzQjtRQUNsQyxZQUFZLEVBQUUsc0RBQXNEO1FBQ3BFLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU07S0FDdkM7SUFDRCxlQUFlLEVBQUU7UUFDZixVQUFVLEVBQUUscUJBQXFCO1FBQ2pDLFlBQVksRUFBRSwwRUFBMEU7UUFDeEYsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCO0tBQ2xEO0lBQ0Qsa0JBQWtCLEVBQUU7UUFDbEIsVUFBVSxFQUFFLGlDQUFpQztRQUM3QyxZQUFZLEVBQUUsMkRBQTJEO1FBQ3pFLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFlBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUM7S0FDbkU7Q0FDRixDQUFDIn0=