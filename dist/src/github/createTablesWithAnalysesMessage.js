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
            shouldCollapseDetails ? details(messageBody, 'Comparison details') : messageBody,
            ``,
            interestingMetrics && getInterestingMetricsMessage(interestingMetrics),
        ]).join('\n');
    }).join('\n\n');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVGFibGVzV2l0aEFuYWx5c2VzTWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvY3JlYXRlVGFibGVzV2l0aEFuYWx5c2VzTWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUE0RTtBQUM1RSxzQ0FBOEY7QUFDOUYsMENBQXVGO0FBRXZGLFNBQWdCLCtCQUErQixDQUFDLEtBQTJGLEVBQUUsUUFBZ0IsRUFBRSxrQkFBa0IsR0FBRyxLQUFLO0lBQ3ZMLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUU7UUFDbkMsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLElBQUksZ0NBQXFCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzFFLE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztRQUNoRixNQUFNLFdBQVcsR0FBRztZQUNsQixNQUFNO2dCQUNKLENBQUMsQ0FBQyxtQ0FBcUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLGNBQWMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUUsYUFBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQzdHLENBQUMsQ0FBQyxrQ0FBb0IsQ0FBQyxLQUFLLENBQUM7WUFDL0IsRUFBRTtZQUNGLE1BQU0sSUFBSSx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO1NBQ2xELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWIsT0FBTyxnQkFBTyxDQUFDO1lBQ2IsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksa0JBQWtCLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEtBQUssS0FBSyxDQUFDLElBQUksQ0FB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