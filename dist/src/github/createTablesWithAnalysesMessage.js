"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createTable_1 = require("./createTable");
const common_1 = require("../common");
const analysis_1 = require("../analysis");
function createTablesWithAnalysesMessage(pairs, prNumber, alwaysWriteHeading = false) {
    return pairs.map(([before, after]) => {
        const interestingMetrics = before && analysis_1.getInterestingMetrics(before, after);
        const shouldCollapseDetails = !interestingMetrics || !interestingMetrics.length;
        const messageBody = [
            before
                ? createTable_1.createComparisonTable(before, after, getBeforeTitle(before, after), getAfterTitle(before, after, prNumber))
                : createTable_1.createSingleRunTable(after),
            ``,
            before && getSystemMismatchMessage(before, after),
        ].join('\n');
        return common_1.compact([
            pairs.length > 1 || alwaysWriteHeading ? `### ${after.body.packageName}/v${after.body.packageVersion}` : undefined,
            getIntroMessage(before, after),
            ``,
            getLanguageServiceCrashMessage(after),
            ``,
            shouldCollapseDetails ? details(messageBody, getDetailsSummaryTitle(pairs.length, after)) : messageBody,
            ``,
            interestingMetrics && getInterestingMetricsMessage(interestingMetrics),
        ]).join('\n');
    }).join('\n\n');
}
exports.createTablesWithAnalysesMessage = createTablesWithAnalysesMessage;
function getDetailsSummaryTitle(comparisonsCount, benchmark) {
    const title = '<strong>Comparison details</strong>';
    if (comparisonsCount > 1) {
        return title + ` for ${common_1.toPackageKey(benchmark.body.packageName, benchmark.body.packageVersion)} 📊`;
    }
    return `${title} 📊`;
}
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
function getInterestingMetricsMessage(interestingMetrics) {
    if (!interestingMetrics.length) {
        return `It looks like nothing changed too much. I’m pretty lenient since I’m still an experiment, so take a look anyways and make sure nothing looks out of place.`;
    }
    const awesomeMetrics = interestingMetrics.filter(({ significance }) => significance === "awesome" /* Awesome */);
    if (interestingMetrics.length === awesomeMetrics.length) {
        return `Wow, it looks like all the big movers moved in the right direction! Way to go! 🌟`;
    }
    if (interestingMetrics.length > 3 && awesomeMetrics.length / interestingMetrics.length < 0.5) {
        return 'It looks like there are several metrics that changed quite a bit. You might want to take a look and make sure your changes won’t cause slow-downs for users consuming these types.';
    }
    const metricsToCheck = interestingMetrics.filter(({ significance }) => significance === "warning" /* Warning */ || significance === "alert" /* Alert */);
    return `Looks like there were a couple significant differences—take a look at `
        + formatListForSentence(metricsToCheck.map(m => `**${m.metric.sentenceName}**`))
        + ` to make sure everything looks ok.`;
}
function details(details, summary) {
    return common_1.compact([
        '<details>',
        summary && `<summary>${summary}</summary>`,
        '',
        details,
        `</details>`
    ]).join('\n');
}
function formatListForSentence(items) {
    return items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        return !isFirst && isLast ? `and ${item}` : item;
    }).join(items.length > 2 ? ', ' : ' ');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVGFibGVzV2l0aEFuYWx5c2VzTWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvY3JlYXRlVGFibGVzV2l0aEFuYWx5c2VzTWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUE0RTtBQUM1RSxzQ0FBNEc7QUFDNUcsMENBQXVGO0FBRXZGLFNBQWdCLCtCQUErQixDQUFDLEtBQTJGLEVBQUUsUUFBZ0IsRUFBRSxrQkFBa0IsR0FBRyxLQUFLO0lBQ3ZMLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUU7UUFDbkMsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLElBQUksZ0NBQXFCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzFFLE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztRQUNoRixNQUFNLFdBQVcsR0FBRztZQUNsQixNQUFNO2dCQUNKLENBQUMsQ0FBQyxtQ0FBcUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLGNBQWMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUUsYUFBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzdHLENBQUMsQ0FBQyxrQ0FBb0IsQ0FBQyxLQUFLLENBQUM7WUFDL0IsRUFBRTtZQUNGLE1BQU0sSUFBSSx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO1NBQ2xELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWIsT0FBTyxnQkFBTyxDQUFDO1lBQ2IsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksa0JBQWtCLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEtBQUssS0FBSyxDQUFDLElBQUksQ0FB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