"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_table_1 = __importDefault(require("markdown-table"));
const common_1 = require("../common");
const metrics_1 = require("./metrics");
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
exports.createTable = createTable;
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
        ? common_1.getPercentDiff(aValue, bValue)
        : undefined;
    return [
        `**${title}**`,
        format(aValue),
        format(bValue),
        typeof percentDiff === 'number' ? formatDiff(percentDiff) : '',
    ];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZ2l0aHViL2NyZWF0ZVRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0VBQW1DO0FBQ25DLHNDQUFzRjtBQUN0Rix1Q0FBNEM7QUFFNUMsU0FBZ0IsV0FBVyxDQUFDLENBQW9DLEVBQUUsQ0FBb0MsRUFBRSxRQUFnQjtJQUN0SCxPQUFPLHdCQUFLLENBQUM7UUFDWCxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxRQUFRLEVBQUUsRUFBRSxNQUFNLENBQUM7UUFDdEMsQ0FBQyx1QkFBdUIsQ0FBQztRQUN6QixtQkFBbUIsQ0FBQyxpQkFBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLG1CQUFtQixDQUFDLGlCQUFPLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RCxtQkFBbUIsQ0FBQyxpQkFBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbkQsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELENBQUMsbUNBQW1DLENBQUM7UUFDckMsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQyxtQkFBbUIsQ0FBQyxpQkFBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELENBQUMsNEJBQTRCLENBQUM7UUFDOUIsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxtQkFBbUIsQ0FBQyxpQkFBTyxDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEQsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUs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