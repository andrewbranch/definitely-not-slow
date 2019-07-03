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
    return markdown_table_1.default(common_1.compact([
        ['', beforeTitle, afterTitle, 'diff'],
        ['**Batch compilation**'],
        common_1.supportsMemoryUsage(before) && common_1.supportsMemoryUsage(after)
            ? createComparisonRowFromMetric(analysis_1.metrics.memoryUsage, before, after)
            : undefined,
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
        createComparisonRowFromMetric(analysis_1.metrics.completionsAvgCV, before, after, { indent: 1 }),
        createComparisonRowFromMetric(analysis_1.metrics.completionsWorstMean, before, after, { indent: 1 }),
        createComparisonRow('Worst identifier', before, after, x => sourceLink(x.body.completions.worst.identifierText, x.body.sourceVersion, x.body.completions.worst.fileName, x.body.completions.worst.line), undefined, { indent: 1 }),
        ['**`getQuickInfoAtPosition`**'],
        createComparisonRowFromMetric(analysis_1.metrics.quickInfoMean, before, after, { indent: 1 }),
        createComparisonRowFromMetric(analysis_1.metrics.quickInfoMedian, before, after, { indent: 1 }),
        createComparisonRowFromMetric(analysis_1.metrics.quickInfoAvgCV, before, after, { indent: 1 }),
        createComparisonRowFromMetric(analysis_1.metrics.quickInfoWorstMean, before, after, { indent: 1 }),
        createComparisonRow('Worst identifier', before, after, x => sourceLink(x.body.quickInfo.worst.identifierText, x.body.sourceVersion, x.body.quickInfo.worst.fileName, x.body.quickInfo.worst.line), undefined, { indent: 1 }),
        // Only show system info if they’re not identical
        ...(before.system.hash === after.system.hash ? [] : [
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
        ]),
    ]));
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
        createSingleRunRowFromMetric(analysis_1.metrics.completionsAvgCV, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(analysis_1.metrics.completionsWorstMean, benchmark, { indent: 1 }),
        createSingleRunRow('Worst identifier', benchmark, x => sourceLink(x.body.completions.worst.identifierText, x.body.sourceVersion, x.body.completions.worst.fileName, x.body.completions.worst.line), { indent: 1 }),
        ['**`getQuickInfoAtPosition`**'],
        createSingleRunRowFromMetric(analysis_1.metrics.quickInfoMean, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(analysis_1.metrics.quickInfoMedian, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(analysis_1.metrics.quickInfoAvgCV, benchmark, { indent: 1 }),
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
        format(aValue, formatOptions),
        format(bValue, formatOptions),
        diff || '',
    ];
}
function createSingleRunRow(title, benchmark, getValue, formatOptions = {}) {
    const value = getValue(benchmark);
    return [
        indent(title, formatOptions.indent || 0),
        format(value, formatOptions),
    ];
}
function indent(text, level) {
    return '&nbsp;'.repeat(4 * level) + text;
}
function formatDiff(percentDiff, significance, precision) {
    const percentString = format(percentDiff, { percentage: true }, '%', true);
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
function format(x, { precision = 1, percentage } = {}, unit = percentage ? '%' : '', showPlusSign) {
    switch (typeof x) {
        case 'string': return x + unit;
        case 'number':
            if (isNaN(x) || !isFinite(x))
                return '';
            let numString = (percentage ? x * 100 : x).toFixed(precision).replace(/^-0(\.0*)?$/, '0$1');
            if (showPlusSign && x > 0 && !/^0(\.0*)?$/.test(numString))
                numString = `+${numString}`;
            return numString + unit;
        default: return '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZ2l0aHViL2NyZWF0ZVRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0VBQW1DO0FBQ25DLHNDQUFvSDtBQUNwSCwwQ0FBZ0Y7QUFDaEYsd0RBQTREO0FBRTVELFNBQWdCLHFCQUFxQixDQUFDLE1BQXlDLEVBQUUsS0FBd0MsRUFBRSxXQUFtQixFQUFFLFVBQWtCO0lBQ2hLLE9BQU8sd0JBQUssQ0FBQyxnQkFBTyxDQUFDO1FBQ25CLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDO1FBQ3JDLENBQUMsdUJBQXVCLENBQUM7UUFDekIsNEJBQW1CLENBQUMsTUFBTSxDQUFDLElBQUksNEJBQW1CLENBQUMsS0FBSyxDQUFDO1lBQ3ZELENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxrQkFBTyxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO1lBQ25FLENBQUMsQ0FBQyxTQUFTO1FBQ2IsNkJBQTZCLENBQUMsa0JBQU8sQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztRQUMvRCw2QkFBNkIsQ0FBQyxrQkFBTyxDQUFDLHNCQUFzQixFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDNUUsNkJBQTZCLENBQUMsa0JBQU8sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO1FBQ3RFLDZCQUE2QixDQUFDLGtCQUFPLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztRQUN2RSxFQUFFO1FBQ0YsQ0FBQyxzQkFBc0IsQ0FBQztRQUN4Qiw2QkFBNkIsQ0FBQyxrQkFBTyxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO1FBQ2xFLDZCQUE2QixDQUFDLGtCQUFPLENBQUMsZUFBZSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDckUsQ0FBQyxn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