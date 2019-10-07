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
        [],
        ['**Language service**'],
        createComparisonRowFromMetric(analysis_1.metrics.samplesTaken, before, after),
        createComparisonRowFromMetric(analysis_1.metrics.identifierCount, before, after),
        ['**`getCompletionsAtPosition`**'],
        createComparisonRowFromMetric(analysis_1.metrics.completionsMean, before, after, { indent: 1 }),
        createComparisonRowFromMetric(analysis_1.metrics.completionsAvgCV, before, after, { indent: 1 }),
        createComparisonRowFromMetric(analysis_1.metrics.completionsWorstMean, before, after, { indent: 1 }),
        createComparisonRow('Worst identifier', before, after, x => sourceLink(x.body.completions.worst.identifierText, x.body.sourceVersion, x.body.completions.worst.fileName, x.body.completions.worst.line), undefined, { indent: 1 }),
        ['**`getQuickInfoAtPosition`**'],
        createComparisonRowFromMetric(analysis_1.metrics.quickInfoMean, before, after, { indent: 1 }),
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
        [],
        ['**Language service measurements**'],
        createSingleRunRowFromMetric(analysis_1.metrics.samplesTaken, benchmark),
        createSingleRunRowFromMetric(analysis_1.metrics.identifierCount, benchmark),
        ['**`getCompletionsAtPosition`**'],
        createSingleRunRowFromMetric(analysis_1.metrics.completionsMean, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(analysis_1.metrics.completionsAvgCV, benchmark, { indent: 1 }),
        createSingleRunRowFromMetric(analysis_1.metrics.completionsWorstMean, benchmark, { indent: 1 }),
        createSingleRunRow('Worst identifier', benchmark, x => sourceLink(x.body.completions.worst.identifierText, x.body.sourceVersion, x.body.completions.worst.fileName, x.body.completions.worst.line), { indent: 1 }),
        ['**`getQuickInfoAtPosition`**'],
        createSingleRunRowFromMetric(analysis_1.metrics.quickInfoMean, benchmark, { indent: 1 }),
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
function createComparisonRowFromMetric(metric, before, after, formatOptions = {}) {
    const beforeValue = metric.getValue(before);
    const afterValue = metric.getValue(after);
    const format = Object.assign(Object.assign({}, metric.formatOptions), formatOptions);
    const percentDiff = !format.noDiff && typeof beforeValue === 'number' && typeof afterValue === 'number' && !isNaN(afterValue) && !isNaN(afterValue)
        ? common_1.getPercentDiff(afterValue, beforeValue)
        : undefined;
    const diffString = typeof percentDiff === 'number' ? formatDiff(percentDiff, metric.getSignificance(percentDiff, beforeValue, afterValue, before, after), format.precision) : undefined;
    return createComparisonRow(metric.columnName, before, after, metric.getValue, diffString, format);
}
function createSingleRunRowFromMetric(metric, benchmark, formatOptions) {
    return createSingleRunRow(metric.columnName, benchmark, metric.getValue, Object.assign(Object.assign({}, metric.formatOptions), formatOptions));
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
    const percentString = format(percentDiff, { percentage: true, precision }, '%', true);
    if (!significance || !percentString) {
        return percentString;
    }
    switch (significance) {
        case "warning" /* Warning */: return `**${percentString}**&nbsp;🔸`;
        case "alert" /* Alert */: return `**${percentString}**&nbsp;🚨`;
        case "awesome" /* Awesome */: return `**${percentString}**&nbsp;🌟`;
        default: return util_1.assertNever(significance);
    }
}
exports.formatDiff = formatDiff;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZ2l0aHViL2NyZWF0ZVRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0VBQW1DO0FBQ25DLHNDQUFvSDtBQUNwSCwwQ0FBZ0Y7QUFDaEYsd0RBQTREO0FBRTVELFNBQWdCLHFCQUFxQixDQUFDLE1BQXlDLEVBQUUsS0FBd0MsRUFBRSxXQUFtQixFQUFFLFVBQWtCO0lBQ2hLLE9BQU8sd0JBQUssQ0FBQyxnQkFBTyxDQUFDO1FBQ25CLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDO1FBQ3JDLENBQUMsdUJBQXVCLENBQUM7UUFDekIsNEJBQW1CLENBQUMsTUFBTSxDQUFDLElBQUksNEJBQW1CLENBQUMsS0FBSyxDQUFDO1lBQ3ZELENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxrQkFBTyxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO1lBQ25FLENBQUMsQ0FBQyxTQUFTO1FBQ2IsNkJBQTZCLENBQUMsa0JBQU8sQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztRQUMvRCw2QkFBNkIsQ0FBQyxrQkFBTyxDQUFDLHNCQUFzQixFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDNUUsRUFBRTtRQUNGLENBQUMsc0JBQXNCLENBQUM7UUFDeEIsNkJBQTZCLENBQUMsa0JBQU8sQ0FBQyxZQUFZLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztRQUNsRSw2QkFBNkIsQ0FBQyxrQkFBTyxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO1FBQ3JFLENBQUMsZ0NBQWdDLENBQUM7UUFDbEMsNkJBQTZCLENBQUMsa0JBQU8sQ0FBQyxlQUFlLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNwRiw2QkFBNkIsQ0FBQyxrQkFB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