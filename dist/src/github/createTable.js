"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_table_1 = __importDefault(require("markdown-table"));
const common_1 = require("../common");
const metrics_1 = require("./metrics");
function createComparisonTable(before, after, beforeTitle, afterTitle) {
    return markdown_table_1.default([
        ['', beforeTitle, afterTitle, 'diff'],
        ['**Batch compilation**'],
        createComparisonRowFromMetric(metrics_1.metrics.memoryUsage, before, after),
        createComparisonRowFromMetric(metrics_1.metrics.typeCount, before, after),
        createComparisonRowFromMetric(metrics_1.metrics.assignabilityCacheSize, before, after),
        createComparisonRowFromMetric(metrics_1.metrics.subtypeCacheSize, before, after),
        createComparisonRowFromMetric(metrics_1.metrics.identityCacheSize, before, after),
        [],
        ['**Language service measurements**'],
        createComparisonRowFromMetric(metrics_1.metrics.samplesTaken, before, after),
        createComparisonRowFromMetric(metrics_1.metrics.identifierCount, before, after),
        ['**`getCompletionsAtPosition`**'],
        createComparisonRowFromMetric(metrics_1.metrics.completionsMean, before, after, { indent: 1 }),
        createComparisonRowFromMetric(metrics_1.metrics.completionsMedian, before, after, { indent: 1 }),
        createComparisonRowFromMetric(metrics_1.metrics.completionsStdDev, before, after, { indent: 1 }),
        createComparisonRowFromMetric(metrics_1.metrics.completionsWorstMean, before, after, { indent: 1 }),
        createComparisonRow('Worst identifier', before, after, x => sourceLink(x.body.completions.worst.identifierText, x.body.sourceVersion, x.body.completions.worst.fileName, x.body.completions.worst.line), { indent: 1 }),
        ['**`getQuickInfoAtPosition`**'],
        createComparisonRowFromMetric(metrics_1.metrics.quickInfoMean, before, after, { indent: 1 }),
        createComparisonRowFromMetric(metrics_1.metrics.quickInfoMedian, before, after, { indent: 1 }),
        createComparisonRowFromMetric(metrics_1.metrics.quickInfoStdDev, before, after, { indent: 1 }),
        createComparisonRowFromMetric(metrics_1.metrics.quickInfoWorstMean, before, after, { indent: 1 }),
        createComparisonRow('Worst identifier', before, after, x => sourceLink(x.body.quickInfo.worst.identifierText, x.body.sourceVersion, x.body.quickInfo.worst.fileName, x.body.quickInfo.worst.line), { indent: 1 }),
        [],
        ['**System information**'],
        createComparisonRow('Node version', before, after, x => x.system.nodeVersion),
        createComparisonRow('CPU count', before, after, x => x.system.cpus.length, { precision: 0 }),
        createComparisonRow('CPU speed', before, after, x => `${x.system.cpus[0].speed / 1000} GHz`),
        createComparisonRow('CPU model', before, after, x => x.system.cpus[0].model),
        createComparisonRow('CPU Architecture', before, after, x => x.system.arch),
        createComparisonRow('Memory', before, after, x => `${format(x.system.totalmem / Math.pow(2, 30))} GiB`),
        createComparisonRow('Platform', before, after, x => x.system.platform),
        createComparisonRow('Release', before, after, x => x.system.release),
    ]);
}
exports.createComparisonTable = createComparisonTable;
function createSingleRunTable(benchmark) {
    return markdown_table_1.default([
        ['**Batch compilation**'],
        createSingleRunRowFromMetric(metrics_1.metrics.memoryUsage, benchmark),
        createSingleRunRowFromMetric(metrics_1.metrics.typeCount, benchmark),
        createSingleRunRowFromMetric(metrics_1.metrics.assignabilityCacheSize, benchmark),
        createSingleRunRowFromMetric(metrics_1.metrics.subtypeCacheSize, benchmark),
        createSingleRunRowFromMetric(metrics_1.metrics.identityCacheSize, benchmark),
        [],
        ['**Language service measurements**'],
        createSingleRunRowFromMetric(metrics_1.metrics.samplesTaken, benchmark),
        createSingleRunRowFromMetric(metrics_1.metrics.identifierCount, benchmark),
        ['**`getCompletionsAtPosition`**'],
        createSingleRunRowFromMetric(metrics_1.metrics.completionsMean, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(metrics_1.metrics.completionsMedian, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(metrics_1.metrics.completionsStdDev, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(metrics_1.metrics.completionsWorstMean, benchmark, { indent: 1 }),
        createSingleRunRow('Worst identifier', benchmark, x => sourceLink(x.body.completions.worst.identifierText, x.body.sourceVersion, x.body.completions.worst.fileName, x.body.completions.worst.line), { indent: 1 }),
        ['**`getQuickInfoAtPosition`**'],
        createSingleRunRowFromMetric(metrics_1.metrics.quickInfoMean, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(metrics_1.metrics.quickInfoMedian, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(metrics_1.metrics.quickInfoStdDev, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(metrics_1.metrics.quickInfoWorstMean, benchmark, { indent: 1 }),
        createSingleRunRow('Worst identifier', benchmark, x => sourceLink(x.body.quickInfo.worst.identifierText, x.body.sourceVersion, x.body.quickInfo.worst.fileName, x.body.quickInfo.worst.line), { indent: 1 }),
        [],
        ['**System information**'],
        createSingleRunRow('Node version', benchmark, x => x.system.nodeVersion),
        createSingleRunRow('CPU count', benchmark, x => x.system.cpus.length, { precision: 0 }),
        createSingleRunRow('CPU speed', benchmark, x => `${x.system.cpus[0].speed / 1000} GHz`),
        createSingleRunRow('CPU model', benchmark, x => x.system.cpus[0].model),
        createSingleRunRow('CPU Architecture', benchmark, x => x.system.arch),
        createSingleRunRow('Memory', benchmark, x => `${format(x.system.totalmem / Math.pow(2, 30))} GiB`),
        createSingleRunRow('Platform', benchmark, x => x.system.platform),
        createSingleRunRow('Release', benchmark, x => x.system.release),
    ]);
}
exports.createSingleRunTable = createSingleRunTable;
function sourceLink(text, sourceVersion, fileName, line) {
    return `[${text}](/${common_1.config.github.commonParams.owner}/${common_1.config.github.commonParams.repo}/blob/${sourceVersion.replace('\n', '')}/${fileName}#L${line})`;
}
function createComparisonRowFromMetric(metric, a, b, formatOptions) {
    return createComparisonRow(metric.columnName, a, b, metric.getValue, Object.assign({}, metric.formatOptions, formatOptions));
}
function createSingleRunRowFromMetric(metric, benchmark, formatOptions) {
    return createSingleRunRow(metric.columnName, benchmark, metric.getValue, Object.assign({}, metric.formatOptions, formatOptions));
}
function createComparisonRow(title, a, b, getValue, formatOptions = {}) {
    const aValue = getValue(a);
    const bValue = getValue(b);
    const percentDiff = !formatOptions.noDiff && typeof aValue === 'number' && typeof bValue === 'number' && !isNaN(bValue) && !isNaN(bValue)
        ? common_1.getPercentDiff(bValue, aValue)
        : undefined;
    return [
        indent(title, formatOptions.indent || 0),
        format(aValue, formatOptions.precision),
        format(bValue, formatOptions.precision),
        typeof percentDiff === 'number' ? formatDiff(percentDiff, formatOptions.precision) : '',
    ];
}
function createSingleRunRow(title, benchmark, getValue, formatOptions = {}) {
    const value = getValue(benchmark);
    return [
        indent(title, formatOptions.indent || 0),
        format(value, formatOptions.precision),
    ];
}
function indent(text, level) {
    return '&nbsp;'.repeat(4 * level) + text;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZ2l0aHViL2NyZWF0ZVRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0VBQW1DO0FBQ25DLHNDQUFzRjtBQUN0Rix1Q0FBMkQ7QUFFM0QsU0FBZ0IscUJBQXFCLENBQUMsTUFBeUMsRUFBRSxLQUF3QyxFQUFFLFdBQW1CLEVBQUUsVUFBa0I7SUFDaEssT0FBTyx3QkFBSyxDQUFDO1FBQ1gsQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUM7UUFDckMsQ0FBQyx1QkFBdUIsQ0FBQztRQUN6Qiw2QkFBNkIsQ0FBQyxpQkFBTyxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO1FBQ2pFLDZCQUE2QixDQUFDLGlCQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDL0QsNkJBQTZCLENBQUMsaUJBQU8sQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO1FBQzVFLDZCQUE2QixDQUFDLGlCQUFPLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztRQUN0RSw2QkFBNkIsQ0FBQyxpQkFBTyxDQUFDLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDdkUsRUFBRTtRQUNGLENBQUMsbUNBQW1DLENBQUM7UUFDckMsNkJBQTZCLENBQUMsaUJBQU8sQ0FBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztRQUNsRSw2QkFBNkIsQ0FBQyxpQkFBTyxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO1FBQ3JFLENBQUMsZ0NBQWdDLENBQUM7UUFDbEMsNkJBQTZCLENBQUMsaUJBQU8sQ0FBQyxlQUFlLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNwRiw2QkFB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