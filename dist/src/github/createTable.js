"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_table_1 = __importDefault(require("markdown-table"));
const common_1 = require("../common");
const metrics_1 = require("./metrics");
function createTable(a, b, leftTitle, rightTitle) {
    return markdown_table_1.default([
        ['', leftTitle, rightTitle, 'diff'],
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
        createRow('CPU count', a, b, x => x.system.cpus.length, { precision: 0 }),
        createRow('CPU speed', a, b, x => `${x.system.cpus[0].speed / 1000} GHz`),
        createRow('CPU model', a, b, x => x.system.cpus[0].model),
        createRow('CPU Architecture', a, b, x => x.system.arch),
        createRow('Memory', a, b, x => `${format(x.system.totalmem / Math.pow(2, 30))} GiB`),
        createRow('Platform', a, b, x => x.system.platform),
        createRow('Release', a, b, x => x.system.release),
    ]);
}
exports.createTable = createTable;
function sourceLink(text, sourceVersion, fileName, line) {
    return `[${text}](/${common_1.config.github.commonParams.owner}/${common_1.config.github.commonParams.repo}/blob/${sourceVersion.replace('\n', '')}/${fileName}#L${line})`;
}
function createRowFromMetric(metric, a, b) {
    return createRow(metric.columnName, a, b, metric.getValue, metric.formatOptions);
}
function createRow(title, a, b, getValue, formatOptions = {}) {
    const aValue = getValue(a);
    const bValue = getValue(b);
    const percentDiff = !formatOptions.noDiff && typeof aValue === 'number' && typeof bValue === 'number' && !isNaN(bValue) && !isNaN(bValue)
        ? common_1.getPercentDiff(bValue, aValue)
        : undefined;
    return [
        `**${title}**`,
        format(aValue, formatOptions.precision),
        format(bValue, formatOptions.precision),
        typeof percentDiff === 'number' ? formatDiff(percentDiff, formatOptions.precision) : '',
    ];
}
function formatDiff(percentDiff, precision) {
    const percentString = `${percentDiff > 0 ? '+' : ''}${format(percentDiff * 100, precision)}%`;
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
function format(x, precision = 1) {
    switch (typeof x) {
        case 'string': return x;
        case 'number': return isNaN(x) ? 'N/A' : x.toFixed(precision);
        default: return '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZ2l0aHViL2NyZWF0ZVRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0VBQW1DO0FBQ25DLHNDQUFzRjtBQUN0Rix1Q0FBMkQ7QUFFM0QsU0FBZ0IsV0FBVyxDQUFDLENBQW9DLEVBQUUsQ0FBb0MsRUFBRSxTQUFpQixFQUFFLFVBQWtCO0lBQzNJLE9BQU8sd0JBQUssQ0FBQztRQUNYLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDO1FBQ25DLENBQUMsdUJBQXVCLENBQUM7UUFDekIsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QyxtQkFBbUIsQ0FBQyxpQkFBTyxDQUFDLHNCQUFzQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDekQsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELG1CQUFtQixDQUFDLGlCQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwRCxDQUFDLG1DQUFtQyxDQUFDO1FBQ3JDLG1CQUFtQixDQUFDLGlCQUFPLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDL0MsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxDQUFDLDRCQUE0QixDQUFDO1FBQzlCLG1CQUFtQixDQUFDLGlCQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEQsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELG1CQUFtQixDQUFDLGlCQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwRCxtQkFBbUIsQ0FBQyxpQkFBTyxDQUFDLG9CQUFvQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkQsU0FBUyxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQ2pELENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQ3ZDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUNwQixDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUNqQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsQ0FBQywwQkFBMEIsQ0FBQztRQUM1QixtQkFBbUIsQ0FBQyxpQkFBTyxDQUFDLGFBQWEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELG1CQUFtQixDQUFDLGlCQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEQsbUJBQW1CLENBQUMsaUJBQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxtQkFBbUIsQ0FBQyxpQkFBTyxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckQsU0FBUyxDQUFDLGtCQUFrQixFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQ2pELENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQ3JDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUNwQixDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUMvQixDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQyx3QkFBd0IsQ0FBQztRQUMxQixTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDekUsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUM7UUFDekUsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3pELFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDdkQsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsU0FBQSxDQUFDLEVBQUksRUFBRSxDQUFBLENBQUMsTUFBTSxDQUFDO1FBQzVFLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ25ELFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO0tBQ2xELENBQUMsQ0FBQztBQUNMLENBQUM7QUF4Q0Qsa0NBd0NDO0FBRUQsU0FBUyxVQUFVLENBQUMsSUFBWSxFQUFFLGFB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