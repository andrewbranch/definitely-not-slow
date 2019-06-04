"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createTable_1 = require("./createTable");
const common_1 = require("../common");
const analysis_1 = require("../analysis");
function createTablesWithAnalysesMessage(pairs, prNumber, alwaysWriteHeading = false, alwaysCollapseDetails = false) {
    return pairs.map(([before, after]) => {
        const interestingMetrics = before && analysis_1.getInterestingMetrics(before, after);
        const shouldCollapseDetails = alwaysCollapseDetails || !interestingMetrics || !interestingMetrics.length;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVGFibGVzV2l0aEFuYWx5c2VzTWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvY3JlYXRlVGFibGVzV2l0aEFuYWx5c2VzTWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUE0RTtBQUM1RSxzQ0FBNEc7QUFDNUcsMENBQXVGO0FBRXZGLFNBQWdCLCtCQUErQixDQUFDLEtBQTJGLEVBQUUsUUFBZ0IsRUFBRSxrQkFBa0IsR0FBRyxLQUFLLEVBQUUscUJBQXFCLEdBQUcsS0FBSztJQUN0TixPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFO1FBQ25DLE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxJQUFJLGdDQUFxQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRSxNQUFNLHFCQUFxQixHQUFHLHFCQUFxQixJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUM7UUFDekcsTUFBTSxXQUFXLEdBQUc7WUFDbEIsTUFBTTtnQkFDSixDQUFDLENBQUMsbUNBQXFCLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxjQUFjLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxFQUFFLGFBQWEsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUM3RyxDQUFDLENBQUMsa0NBQW9CLENBQUMsS0FBSyxDQUFDO1lBQy9CLEVBQUU7WUFDRixNQUFNLElBQUksd0JBQXdCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQztTQUNsRCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUViLE9BQU8sZ0JBQU8sQ0FBQztZQUNiLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxJQUFJ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