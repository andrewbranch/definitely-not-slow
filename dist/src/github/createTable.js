"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const markdown_table_1 = __importDefault(require("markdown-table"));
const common_1 = require("../common");
const analysis_1 = require("../analysis");
const util_1 = require("types-publisher/bin/util/util");
function createComparisonTable(before, after, beforeTitle, afterTitle) {
    return markdown_table_1.default([
        ['', beforeTitle, afterTitle, 'diff'],
        ['**Batch compilation**'],
        // createComparisonRowFromMetric(metrics.memoryUsage, before, after),
        createComparisonRowFromMetric(analysis_1.metrics.typeCount, before, after),
        createComparisonRowFromMetric(analysis_1.metrics.assignabilityCacheSize, before, after),
        createComparisonRowFromMetric(analysis_1.metrics.subtypeCacheSize, before, after),
        createComparisonRowFromMetric(analysis_1.metrics.identityCacheSize, before, after),
        [],
        ['**Language service**'],
        createComparisonRowFromMetric(analysis_1.metrics.samplesTaken, before, after),
        createComparisonRowFromMetric(analysis_1.metrics.identifierCount, before, after),
        ['**`getCompletionsAtPosition`**'],
        createComparisonRowFromMetric(analysis_1.metrics.completionsMean, before, after, { indent: 1 }),
        createComparisonRowFromMetric(analysis_1.metrics.completionsMedian, before, after, { indent: 1 }),
        createComparisonRowFromMetric(analysis_1.metrics.completionsStdDev, before, after, { indent: 1 }),
        createComparisonRowFromMetric(analysis_1.metrics.completionsWorstMean, before, after, { indent: 1 }),
        createComparisonRow('Worst identifier', before, after, x => sourceLink(x.body.completions.worst.identifierText, x.body.sourceVersion, x.body.completions.worst.fileName, x.body.completions.worst.line), undefined, { indent: 1 }),
        ['**`getQuickInfoAtPosition`**'],
        createComparisonRowFromMetric(analysis_1.metrics.quickInfoMean, before, after, { indent: 1 }),
        createComparisonRowFromMetric(analysis_1.metrics.quickInfoMedian, before, after, { indent: 1 }),
        createComparisonRowFromMetric(analysis_1.metrics.quickInfoStdDev, before, after, { indent: 1 }),
        createComparisonRowFromMetric(analysis_1.metrics.quickInfoWorstMean, before, after, { indent: 1 }),
        createComparisonRow('Worst identifier', before, after, x => sourceLink(x.body.quickInfo.worst.identifierText, x.body.sourceVersion, x.body.quickInfo.worst.fileName, x.body.quickInfo.worst.line), undefined, { indent: 1 }),
        [],
        ['**System information**'],
        createComparisonRow('Node version', before, after, x => x.system.nodeVersion),
        createComparisonRow('CPU count', before, after, x => x.system.cpus.length, undefined, { precision: 0 }),
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
        // createSingleRunRowFromMetric(metrics.memoryUsage, benchmark),
        createSingleRunRowFromMetric(analysis_1.metrics.typeCount, benchmark),
        createSingleRunRowFromMetric(analysis_1.metrics.assignabilityCacheSize, benchmark),
        createSingleRunRowFromMetric(analysis_1.metrics.subtypeCacheSize, benchmark),
        createSingleRunRowFromMetric(analysis_1.metrics.identityCacheSize, benchmark),
        [],
        ['**Language service measurements**'],
        createSingleRunRowFromMetric(analysis_1.metrics.samplesTaken, benchmark),
        createSingleRunRowFromMetric(analysis_1.metrics.identifierCount, benchmark),
        ['**`getCompletionsAtPosition`**'],
        createSingleRunRowFromMetric(analysis_1.metrics.completionsMean, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(analysis_1.metrics.completionsMedian, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(analysis_1.metrics.completionsStdDev, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(analysis_1.metrics.completionsWorstMean, benchmark, { indent: 1 }),
        createSingleRunRow('Worst identifier', benchmark, x => sourceLink(x.body.completions.worst.identifierText, x.body.sourceVersion, x.body.completions.worst.fileName, x.body.completions.worst.line), { indent: 1 }),
        ['**`getQuickInfoAtPosition`**'],
        createSingleRunRowFromMetric(analysis_1.metrics.quickInfoMean, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(analysis_1.metrics.quickInfoMedian, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(analysis_1.metrics.quickInfoStdDev, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(analysis_1.metrics.quickInfoWorstMean, benchmark, { indent: 1 }),
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
function createComparisonRowFromMetric(metric, a, b, formatOptions = {}) {
    const aValue = metric.getValue(a);
    const bValue = metric.getValue(b);
    const format = Object.assign({}, metric.formatOptions, formatOptions);
    const percentDiff = typeof aValue === 'number' && typeof bValue === 'number' && !isNaN(bValue) && !isNaN(bValue)
        ? common_1.getPercentDiff(bValue, aValue)
        : undefined;
    const diffString = typeof percentDiff === 'number' ? formatDiff(percentDiff, metric.getSignificance(percentDiff, a, b), format.precision) : undefined;
    return createComparisonRow(metric.columnName, a, b, metric.getValue, diffString, format);
}
function createSingleRunRowFromMetric(metric, benchmark, formatOptions) {
    return createSingleRunRow(metric.columnName, benchmark, metric.getValue, Object.assign({}, metric.formatOptions, formatOptions));
}
function createComparisonRow(title, a, b, getValue, diff, formatOptions = {}) {
    const aValue = getValue(a);
    const bValue = getValue(b);
    return [
        indent(title, formatOptions.indent || 0),
        format(aValue, formatOptions.precision),
        format(bValue, formatOptions.precision),
        diff || '',
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
function formatDiff(percentDiff, significance, precision) {
    const percentString = format(percentDiff * 100, precision, '%', true);
    if (!significance) {
        return percentString;
    }
    switch (significance) {
        case "warning" /* Warning */: return `**${percentString}**&nbsp;🔸`;
        case "alert" /* Alert */: return `**${percentString}**&nbsp;🚨`;
        case "awesome" /* Awesome */: return `**${percentString}**&nbsp;🌟`;
        default: return util_1.assertNever(significance);
    }
}
function format(x, precision = 1, unit = '', showPlusSign) {
    switch (typeof x) {
        case 'string': return x + unit;
        case 'number':
            if (isNaN(x))
                return '';
            let numString = x.toFixed(precision).replace(/^-0(\.0*)?$/, '0$1');
            if (showPlusSign && x > 0 && !/^0(\.0*)?$/.test(numString))
                numString = `+${numString}`;
            return numString + unit;
        default: return '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZ2l0aHViL2NyZWF0ZVRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0VBQW1DO0FBQ25DLHNDQUFzRjtBQUN0RiwwQ0FBZ0Y7QUFDaEYsd0RBQTREO0FBRTVELFNBQWdCLHFCQUFxQixDQUFDLE1BQXlDLEVBQUUsS0FBd0MsRUFBRSxXQUFtQixFQUFFLFVBQWtCO0lBQ2hLLE9BQU8sd0JBQUssQ0FBQztRQUNYLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDO1FBQ3JDLENBQUMsdUJBQXVCLENBQUM7UUFDekIscUVBQXFFO1FBQ3JFLDZCQUE2QixDQUFDLGtCQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDL0QsNkJBQTZCLENBQUMsa0JBQU8sQ0FBQyxzQkFBc0IsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO1FBQzVFLDZCQUE2QixDQUFDLGtCQUFPLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztRQUN0RSw2QkFBNkIsQ0FBQyxrQkFBTyxDQUFDLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDdkUsRUFBRTtRQUNGLENBQUMsc0JBQXNCLENBQUM7UUFDeEIsNkJBQTZCLENBQUMsa0JBQU8sQ0FBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztRQUNsRSw2QkFBNkIsQ0FBQyxrQkFBTyxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO1FBQ3JFLENBQUMsZ0NBQWdDLENBQUM7UUFDbEMsNkJBQTZCLENBQUMsa0JBQU8sQ0FBQyxlQUFlLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNwRiw2QkFBNkIsQ0FBQyxrQkFBTyxDQUFDLGlCQUFpQixFQUFFLE1B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