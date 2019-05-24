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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdENvbXBhcmlzb25SZXN1bHRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dpdGh1Yi9wb3N0Q29tcGFyaXNvblJlc3VsdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLG9FQUFtQztBQUNuQyxzQ0FBc0c7QUFDdEcsNkNBQTBDO0FBQzFDLHdEQUE4RDtBQUM5RCx1Q0FBNEM7QUFFNUMsU0FBc0IscUJBQXFCLENBQUMsQ0FBb0MsRUFBRSxDQUFvQzs7UUFDcEgsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLG9CQUFhLENBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEVBQ2hELG1GQUFtRixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFNUYsTUFBTSxPQUFPLEdBQUcsdUJBQVUsRUFBRSxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxtQkFDdkIsZUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQzdCLFlBQVksRUFBRSxRQUFRLEVBQ3RCLElBQUksRUFBRSxnQkFBTyxDQUFDO2dCQUNaLHNOQUFzTjtnQkFDdE4sRUFBRTtnQkFDRixxQ0FBcUM7Z0JBQ3JDLEVBQUU7Z0JBQ0YsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDO2dCQUMzQixFQUFFO2dCQUNGLHdCQUF3QixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzlCLEVBQUU7Z0JBQ0YsNEJBQTRCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbEMsRUFBRTtnQkFDRixtSUFBbUk7YUFDcEksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFDYixDQUFDO0lBQ0wsQ0FBQztDQUFBO0FBdkJELHNEQXVCQztBQUVELFNBQVMsd0JBQXdCLENBQUMsQ0FBb0MsRUFBRSxDQUFvQztJQUMxRyxPQUFPLENBQUMsOEJBQXFCLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFB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