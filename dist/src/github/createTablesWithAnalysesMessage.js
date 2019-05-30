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
        getLanguageServiceCrashMessage(after),
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
function getLanguageServiceCrashMessage(benchmark) {
    if (benchmark.body.languageServiceCrashed) {
        return `Before we get into it, I need to mention that **the language service crashed** while taking these measurements. ` +
            `This isn’t your fault—on the contrary, you helped us find a probably TypeScript bug! But, be aware that these results ` +
            `may or may not be quite what they should be, depending on how many locations in your tests caused a crash. Paging ` +
            `@andrewbranch to investigate.`;
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVGFibGVzV2l0aEFuYWx5c2VzTWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvY3JlYXRlVGFibGVzV2l0aEFuYWx5c2VzTWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUE0RTtBQUM1RSxzQ0FBc0g7QUFDdEgsdUNBQTRDO0FBRTVDLFNBQWdCLCtCQUErQixDQUFDLEtBQTJGLEVBQUUsUUFBZ0IsRUFBRSxrQkFBa0IsR0FBRyxLQUFLO0lBQ3ZMLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxnQkFBTyxDQUFDO1FBQzVDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDbEgsZUFBZSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDOUIsRUFBRTtRQUNGLDhCQUE4QixDQUFDLEtBQUssQ0FBQztRQUNyQyxFQUFFO1FBQ0YsTUFBTTtZQUNKLENBQUMsQ0FBQyxtQ0FBcUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLGNBQWMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUUsYUFBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDN0csQ0FBQyxDQUFDLGtDQUFvQixDQUFDLEtBQUssQ0FBQztRQUMvQixFQUFFO1FBQ0YsTUFBTSxJQUFJLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDakQsRUFBRTtRQUNGLE1BQU0sSUFBSSw0QkFBNEIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO0tBQ3RELENBQUMsQ0FBQyxJQUFJLENBQUMs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