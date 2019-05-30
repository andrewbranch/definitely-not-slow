"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createTable_1 = require("./createTable");
const common_1 = require("../common");
const metrics_1 = require("./metrics");
function createTablesWithAnalysesMessage(pairs, prNumber, alwaysWriteHeading = false) {
    return pairs.map(([before, after]) => common_1.compact([
        pairs.length > 1 || alwaysWriteHeading ? `### ${after.body.packageName}/v${after.body.packageVersion}` : undefined,
        getIntroMessage(before, after),
        ``,
        before
            ? createTable_1.createComparisonTable(before, after, getBeforeTitle(before, after), getAfterTitle(before, after, prNumber))
            : createTable_1.createSingleRunTable(after),
        ``,
        before && getSystemMismatchMessage(before, after),
        ``,
        before && getInterestingMetricsMessage(before, after),
    ]).join('\n')).join('\n\n');
}
exports.createTablesWithAnalysesMessage = createTablesWithAnalysesMessage;
function getBeforeTitle(before, after) {
    if (before.body.packageVersion === after.body.packageVersion) {
        return 'master';
    }
    return `${before.body.packageVersion}@master`;
}
function getAfterTitle(before, after, prNumber) {
    if (before.body.packageVersion === after.body.packageVersion) {
        return `#${prNumber}`;
    }
    return `${after.body.packageVersion} in #${prNumber}`;
}
function getIntroMessage(before, after) {
    if (before && before.body.packageVersion === after.body.packageVersion) {
        return;
    }
    if (before) {
        return `These typings are for a version of ${before.body.packageName} that doesn’t yet exist on master, so I’ve compared them with v${before.body.packageVersion}.`;
    }
    return `These typings are for a package that doesn’t yet exist on master, so I don’t have anything to compare against yet! In the future, I’ll be able to compare PRs to ${after.body.packageName} with its source on master.`;
}
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
        const percentDiff = isNumber(aValue) && isNumber(bValue) && common_1.getPercentDiff(bValue, aValue);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVGFibGVzV2l0aEFuYWx5c2VzTWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvY3JlYXRlVGFibGVzV2l0aEFuYWx5c2VzTWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUE0RTtBQUM1RSxzQ0FBc0g7QUFDdEgsdUNBQTRDO0FBRTVDLFNBQWdCLCtCQUErQixDQUFDLEtBQTJGLEVBQUUsUUFBZ0IsRUFBRSxrQkFBa0IsR0FBRyxLQUFLO0lBQ3ZMLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxnQkFBTyxDQUFDO1FBQzVDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDbEgsZUFBZSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDOUIsRUFBRTtRQUNGLE1BQU07WUFDSixDQUFDLENBQUMsbUNBQXFCLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxjQUFjLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFLGFBQWEsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzdHLENBQUMsQ0FBQyxrQ0FBb0IsQ0FBQyxLQUFLLENBQUM7UUFDL0IsRUFBRTtRQUNGLE1BQU0sSUFBSSx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO1FBQ2pELEVBQUU7UUFDRixNQUFNLElBQUksNEJBQTRCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQztLQUN0RCxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FB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