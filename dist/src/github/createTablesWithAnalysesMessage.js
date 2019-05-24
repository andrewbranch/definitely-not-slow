"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createTable_1 = require("./createTable");
const common_1 = require("../common");
const metrics_1 = require("./metrics");
function createTablesWithAnalysesMessage(pairs, prNumber, alwaysWriteHeading = false) {
    return pairs.map(([before, after]) => common_1.compact([
        pairs.length > 1 || alwaysWriteHeading ? `### ${before.body.packageName}/v${before.body.packageVersion}` : undefined,
        ``,
        createTable_1.createTable(before, after, prNumber),
        ``,
        getSystemMismatchMessage(before, after),
        ``,
        getInterestingMetricsMessage(before, after),
    ]).join('\n')).join('\n\n');
}
exports.createTablesWithAnalysesMessage = createTablesWithAnalysesMessage;
function getSystemMismatchMessage(a, b) {
    return !common_1.systemsAreCloseEnough(a.system, b.system)
        ? `First off, note that the system varied slightly between these two runs, so you’ll have to take these measurements with a grain of salt.`
        : undefined;
}
function getInterestingMetricsMessage(a, b) {
    const interestingMetrics = getInterestingMetrics(a, b);
    if (!interestingMetrics.length) {
        return `It looks like nothing changed _too_ much. I’m pretty lenient since I’m still an experiment, so take a look anyways and make sure nothing looks out of place.`;
    }
    if (interestingMetrics.every(({ isGood }) => isGood)) {
        return `Wow, it looks like all the big movers moved in the right direction! Way to go! 🌟`;
    }
    if (interestingMetrics.length > 3 && interestingMetrics.filter(({ isGood }) => isGood).length / interestingMetrics.length < 0.5) {
        return `It looks like there are several metrics that changed quite a bit. You might want to take a look and make sure your changes won’t cause painful slow-downs for users consuming these types.`;
    }
    return `Looks like there were a couple significant differences. You might want to take a look and make sure your changes won’t cause painful slow-downs for users consuming these types.`;
}
function getInterestingMetrics(a, b) {
    return Object.values(metrics_1.metrics).reduce((acc, metric) => {
        if (metric.isUninteresting) {
            return acc;
        }
        const aValue = metric.getValue(a);
        const bValue = metric.getValue(b);
        const percentDiff = isNumber(aValue) && isNumber(bValue) && common_1.getPercentDiff(aValue, bValue);
        const comparisonValue = percentDiff && metric.higherIsBetter ? percentDiff * -1 : percentDiff;
        const isGood = comparisonValue < common_1.config.comparison.percentDiffGoldStarThreshold;
        if (percentDiff && comparisonValue && (comparisonValue > common_1.config.comparison.percentDiffWarningThreshold || isGood)) {
            return [
                ...acc,
                { metric, percentDiff, isGood },
            ];
        }
        return acc;
    }, []);
}
function isNumber(n) {
    return typeof n === 'number' && !isNaN(n);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVGFibGVzV2l0aEFuYWx5c2VzTWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvY3JlYXRlVGFibGVzV2l0aEFuYWx5c2VzTWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUE0QztBQUM1QyxzQ0FBc0g7QUFDdEgsdUNBQTRDO0FBRTVDLFNBQWdCLCtCQUErQixDQUFDLEtBQStFLEVBQUUsUUFBZ0IsRUFBRSxrQkFBa0IsR0FBRyxLQUFLO0lBQzNLLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxnQkFBTyxDQUFDO1FBQzVDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDcEgsRUFBRTtRQUNGLHlCQUFXLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUM7UUFDcEMsRUFBRTtRQUNGLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDdkMsRUFBRTtRQUNGLDRCQUE0QixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7S0FDNUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBVkQsMEVBVUM7QUFFRCxTQUFTLHdCQUF3QixDQUFDLENBQW9DLEVBQUUsQ0FBb0M7SUFDMUcsT0FBTyxDQUFDLDhCQUFxQixDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUMvQyxDQUFDLENBQUMseUlBQXlJO1FBQzNJLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQVMsNEJBQTRCLENBQUMsQ0FBb0MsRUFBRSxDQUFvQztJQUM5RyxNQUFNLGtCQUFrQixHQUFHLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFO1FBQzlCLE9BQU8sOEpBQThKLENBQUM7S0FDdks7SUFDRCxJQUFJLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ3BELE9BQU8sbUZBQW1GLENBQUM7S0FDNUY7SUFDRCxJQUFJLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7UUFDL0gsT0FBTyw0TEFBNEwsQ0FBQztLQUNyTTtJQUNELE9BQU8sa0xBQWtMLENBQUM7QUFDNUwsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsQ0FBb0MsRUFBRSxDQUFvQztJQUN2RyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsaUJBQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQStELEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDL0csSUFBSSxNQUFNLENBQUMsZUFBZSxFQUFFO1lBQzFCLE9BQU8sR0FBRyxDQUFDO1NBQ1o7UUFDRCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSx1QkFBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMzRixNQUFNLGVBQWUsR0FBRyxXQUFXLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7UUFDOUYsTUFBTSxNQUFNLEdBQUcsZUFBZSxHQUFHLGVBQU0sQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7UUFDaEYsSUFBSSxXQUFXLElBQUksZUFBZSxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQU0sQ0FBQyxVQUFVLENBQUMsMkJBQTJCLElBQUksTUFBTSxDQUFDLEVBQUU7WUFDakgsT0FBTztnQkFDTCxHQUFHLEdBQUc7Z0JBQ04sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRTthQUNoQyxDQUFDO1NBQ0g7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNULENBQUM7QUFFRCxTQUFTLFFBQVEsQ0FBQyxDQUFNO0lBQ3RCLE9BQU8sT0FBTyxDQUFDLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVDLENBQUMifQ==