"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_table_1 = __importDefault(require("markdown-table"));
const common_1 = require("../common");
const getOctokit_1 = require("./getOctokit");
const util_1 = require("types-publisher/bin/util/util");
const metrics_1 = require("./metrics");
function postComparisonResults(a, b) {
    return __awaiter(this, void 0, void 0, function* () {
        const prNumber = parseInt(util_1.assertDefined(process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER, `Required environment variable 'SYSTEM_PULLREQUEST_PULLREQUESTNUMBER' was not set.`), 10);
        const octokit = getOctokit_1.getOctokit();
        octokit.issues.createComment(Object.assign({}, common_1.config.github.commonParams, { issue_number: prNumber, body: common_1.compact([
                `👋 **Hi there!** I’ve run some quick performance metrics against master and your PR. **This is still an experiment**, so don’t panic if I say something crazy! I’m still learning how to interpret these metrics. 😄`,
                ``,
                `Let’s review the numbers, shall we?`,
                ``,
                createTable(a, b, prNumber),
                ``,
                getSystemMismatchMessage(a, b),
                ``,
                getInterestingMetricsMessage(a, b),
                ``,
                'If you have any questions or comments about me, you can ping [`@andrewbranch`](https://github.com/andrewbranch). Have a nice day!'
            ]).join('\n') }));
    });
}
exports.postComparisonResults = postComparisonResults;
function getSystemMismatchMessage(a, b) {
    return a.system.hash !== b.system.hash
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
        const percentDiff = isNumber(aValue) && isNumber(bValue) && getPercentDiff(aValue, bValue);
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
function createTable(a, b, prNumber) {
    return markdown_table_1.default([
        ['', 'master', `#${prNumber}`, 'diff'],
        ['**Batch compilation**'],
        createRowFromMetric(metrics_1.metrics.typeCount, a, b),
        createRowFromMetric(metrics_1.metrics.assignabilityCacheSize, a, b),
        createRowFromMetric(metrics_1.metrics.subtypeCacheSize, a, b),
        createRowFromMetric(metrics_1.metrics.identityCacheSize, a, b),
        ['**Language service measurements**'],
        createRowFromMetric(metrics_1.metrics.samplesTaken, a, b),
        createRowFromMetric(metrics_1.metrics.identifierCount, a, b),
        ['`getCompletionsAtPosition`'],
        createRowFromMetric(metrics_1.metrics.completionsMean, a, b),
        createRowFromMetric(metrics_1.metrics.completionsMedian, a, b),
        createRowFromMetric(metrics_1.metrics.completionsStdDev, a, b),
        createRowFromMetric(metrics_1.metrics.completionsWorstMean, a, b),
        createRow('Worst identifier', a, b, x => sourceLink(x.body.completions.worst.identifierText, x.body.sourceVersion, x.body.completions.worst.fileName, x.body.completions.worst.line)),
        ['`getQuickInfoAtPosition`'],
        createRowFromMetric(metrics_1.metrics.quickInfoMean, a, b),
        createRowFromMetric(metrics_1.metrics.quickInfoMedian, a, b),
        createRowFromMetric(metrics_1.metrics.quickInfoStdDev, a, b),
        createRowFromMetric(metrics_1.metrics.quickInfoWorstMean, a, b),
        createRow('Worst identifier', a, b, x => sourceLink(x.body.quickInfo.worst.identifierText, x.body.sourceVersion, x.body.quickInfo.worst.fileName, x.body.quickInfo.worst.line)),
        ['**System information**'],
        createRow('CPU count', a, b, x => x.system.cpus.length),
        createRow('CPU speed', a, b, x => `${x.system.cpus[0].speed / 100} GHz`),
        createRow('CPU model', a, b, x => x.system.cpus[0].model),
        createRow('CPU Architecture', a, b, x => x.system.arch),
        createRow('Memory', a, b, x => `${x.system.totalmem / Math.pow(2, 30)} GiB`),
        createRow('Platform', a, b, x => x.system.platform),
        createRow('Release', a, b, x => x.system.release),
    ]);
}
function sourceLink(text, sourceVersion, fileName, line) {
    return `[${text}](/${common_1.config.github.commonParams.owner}/${common_1.config.github.commonParams.repo}/blob/${sourceVersion}/${fileName}#L${line})`;
}
function createRowFromMetric(metric, a, b) {
    return createRow(metric.columnName, a, b, metric.getValue);
}
function createRow(title, a, b, getValue, diffOptions = {}) {
    const aValue = getValue(a);
    const bValue = getValue(b);
    const percentDiff = !diffOptions.noDiff && typeof aValue === 'number' && typeof bValue === 'number' && !isNaN(bValue) && !isNaN(bValue)
        ? getPercentDiff(aValue, bValue)
        : undefined;
    return [
        `**${title}**`,
        format(aValue),
        format(bValue),
        typeof percentDiff === 'number' ? formatDiff(percentDiff) : '',
    ];
}
function isNumber(n) {
    return typeof n === 'number' && !isNaN(n);
}
function getPercentDiff(original, updated) {
    return (updated - original) / original;
}
function formatDiff(percentDiff) {
    const percentString = `${percentDiff > 0 ? '+' : ''}${percentDiff * 100}%`;
    if (percentDiff > common_1.config.comparison.percentDiffSevereThreshold) {
        return `**${percentString}** 🚨`;
    }
    if (percentDiff > common_1.config.comparison.percentDiffWarningThreshold) {
        return `**${percentString}** 🔸`;
    }
    if (percentDiff < common_1.config.comparison.percentDiffGoldStarThreshold) {
        return `**${percentString}** 🌟`;
    }
    return percentString;
}
function format(x) {
    switch (typeof x) {
        case 'string': return x;
        case 'number': return isNaN(x) ? 'N/A' : x.toPrecision(3);
        default: return '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdENvbXBhcmlzb25SZXN1bHRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dpdGh1Yi9wb3N0Q29tcGFyaXNvblJlc3VsdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLG9FQUFtQztBQUNuQyxzQ0FBK0U7QUFDL0UsNkNBQTBDO0FBQzFDLHdEQUE4RDtBQUM5RCx1Q0FBNEM7QUFFNUMsU0FBc0IscUJBQXFCLENBQUMsQ0FBb0MsRUFBRSxDQUFvQzs7UUFDcEgsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLG9CQUFhLENBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEVBQ2hELG1GQUFtRixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFNUYsTUFBTSxPQUFPLEdBQUcsdUJBQVUsRUFBRSxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxtQkFDdkIsZUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQzdCLFlBQVksRUFBRSxRQUFRLEVBQ3RCLElBQUksRUFBRSxnQkFBTyxDQUFDO2dCQUNaLHNOQUFzTjtnQkFDdE4sRUFBRTtnQkFDRixxQ0FBcUM7Z0JBQ3JDLEVBQUU7Z0JBQ0YsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDO2dCQUMzQixFQUFFO2dCQUNGLHdCQUF3QixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzlCLEVBQUU7Z0JBQ0YsNEJBQTRCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbEMsRUFBRTtnQkFDRixtSUFBbUk7YUFDcEksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFDYixDQUFDO0lBQ0wsQ0FBQztDQUFBO0FBdkJELHNEQXVCQztBQUVELFNBQVMsd0JBQXdCLENBQUMsQ0FBb0MsRUFBRSxDQUFvQztJQUMxRyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUNwQyxDQUFDLENBQUMseUlBQXlJO1FBQzNJLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQVMsNEJBQTRCLENBQUMsQ0FBb0MsRUFBRSxDQUFvQztJQUM5RyxNQUFNLGtCQUFrQixHQUFHLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFO1FBQzlCLE9BQU8sOEpBQThKLENBQUM7S0FDdks7SUFDRCxJQUFJLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ3BELE9BQU8sbUZBQW1GLENBQUM7S0FDNUY7SUFDRCxJQUFJLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7UUFDL0gsT0FBTyw0TEFBNEwsQ0FBQztLQUNyTTtJQUNELE9BQU8sa0xBQWtMLENBQUM7QUFDNUwsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsQ0FBb0MsRUFBRSxDQUFvQztJQUN2RyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsaUJBQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQStELEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDL0csSUFBSSxNQUFNLENBQUMsZUFBZSxFQUFFO1lBQzFCLE9BQU8sR0FBRyxDQUFDO1NBQ1o7UUFDRCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzNGLE1BQU0sZUFBZSxHQUFHLFdBQVcsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQztRQUM5RixNQUFNLE1BQU0sR0FBRyxlQUFlLEdBQUcsZUFBTSxDQUFDLFVBQVUsQ0FBQyw0QkFBNEIsQ0FBQztRQUNoRixJQUFJLFdBQVcsSUFBSSxlQUFlLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBTSxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsSUFBSSxNQUFNLENBQUMsRUFBRTtZQUNqSCxPQUFPO2dCQUNMLEdBQUcsR0FBRztnQkFDTixFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFO2FBQ2hDLENBQUM7U0FDSDtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ1QsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLENBQW9DLEVBQUUsQ0FBb0MsRUFBRSxRQUFnQjtJQUMvRyxPQUFPLHdCQUFLLENBQUM7UUFDWCxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxRQUFRLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDdEMsQ0FBQyx1QkFBdUIsQ0FBQztRQUN6QixtQkFBbUIsQ0FBQyxpQkFBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLG1CQUFtQixDQUFDLGlCQUFPLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RCxtQkFBbUIsQ0FBQyxpQkFBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkQsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELENBQUMsbUNBQW1DLENBQUM7UUFDckMsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQyxtQkFBbUIsQ0FBQyxpQkFBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELENBQUMsNEJBQTRCLENBQUM7UUFDOUIsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxtQkFBbUIsQ0FBQyxpQkFBTyxDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEQsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELG1CQUFtQixDQUFDLGlCQUFPLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2RCxTQUFTLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FDakQsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFDdkMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQ3BCLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQ2pDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqQyxDQUFDLDBCQUEwQixDQUFDO1FBQzVCLG1CQUFtQixDQUFDLGlCQUFPLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEQsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxtQkFBbUIsQ0FBQyxpQkFBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELG1CQUFtQixDQUFDLGlCQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyRCxTQUFTLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FDakQsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFDckMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQ3BCLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQy9CLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDLHdCQUF3QixDQUFDO1FBQzFCLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN2RCxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUN4RSxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDekQsU0FBUyxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN2RCxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLFNBQUEsQ0FBQyxFQUFJLEVBQUUsQ0FBQSxNQUFNLENBQUM7UUFDcEUsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDbkQsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7S0FDbEQsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQU1ELFNBQVMsVUFBVSxDQUFDLElBQVksRUFBRSxhQUFxQixFQUFFLFFBQWdCLEVBQUUsSUFBWTtJQUNyRixPQUFPLElBQUksSUFBSSxNQUFNLGVBQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssSUFBSSxlQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLFNBQVMsYUFBYSxJQUFJLFFBQVEsS0FBSyxJQUFJLEdBQUcsQ0FBQztBQUN6SSxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxNQUFjLEVBQUUsQ0FBb0MsRUFBRSxDQUFvQztJQUNySCxPQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FDaEIsS0FBYSxFQUNiLENBQW9DLEVBQ3BDLENBQW9DLEVBQ3BDLFFBQStFLEVBQy9FLGNBQTJCLEVBQUU7SUFFN0IsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQixNQUFNLFdBQVcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDckksQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFFZCxPQUFPO1FBQ0wsS0FBSyxLQUFLLElBQUk7UUFDZCxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2QsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNkLE9BQU8sV0FBVyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0tBQy9ELENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxRQUFRLENBQUMsQ0FBTTtJQUN0QixPQUFPLE9BQU8sQ0FBQyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QyxDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsUUFBZ0IsRUFBRSxPQUFlO0lBQ3ZELE9BQU8sQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLEdBQUcsUUFBUSxDQUFDO0FBQ3pDLENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxXQUFtQjtJQUNyQyxNQUFNLGFBQWEsR0FBRyxHQUFHLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLFdBQVcsR0FBRyxHQUFHLEdBQUcsQ0FBQztJQUMzRSxJQUFJLFdBQVcsR0FBRyxlQUFNLENBQUMsVUFBVSxDQUFDLDBCQUEwQixFQUFFO1FBQzlELE9BQU8sS0FBSyxhQUFhLE9BQU8sQ0FBQztLQUNsQztJQUNELElBQUksV0FBVyxHQUFHLGVBQU0sQ0FBQyxVQUFVLENBQUMsMkJBQTJCLEVBQUU7UUFDL0QsT0FBTyxLQUFLLGFBQWEsT0FBTyxDQUFDO0tBQ2xDO0lBQ0QsSUFBSSxXQUFXLEdBQUcsZUFBTSxDQUFDLFVBQVUsQ0FBQyw0QkFBNEIsRUFBRTtRQUNoRSxPQUFPLEtBQUssYUFBYSxPQUFPLENBQUM7S0FDbEM7SUFDRCxPQUFPLGFBQWEsQ0FBQztBQUN2QixDQUFDO0FBRUQsU0FBUyxNQUFNLENBQUMsQ0FBOEI7SUFDNUMsUUFBUSxPQUFPLENBQUMsRUFBRTtRQUNoQixLQUFLLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hCLEtBQUssUUFBUSxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRCxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNwQjtBQUNILENBQUMifQ==