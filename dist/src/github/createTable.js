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
        // createComparisonRowFromMetric(metrics.memoryUsage, before, after),
        createComparisonRowFromMetric(metrics_1.metrics.typeCount, before, after),
        createComparisonRowFromMetric(metrics_1.metrics.assignabilityCacheSize, before, after),
        createComparisonRowFromMetric(metrics_1.metrics.subtypeCacheSize, before, after),
        createComparisonRowFromMetric(metrics_1.metrics.identityCacheSize, before, after),
        [],
        ['**Language service**'],
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
        // createSingleRunRowFromMetric(metrics.memoryUsage, benchmark),
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
        typeof percentDiff === 'number' ? formatDiff(percentDiff, formatOptions.higherIsBetter, formatOptions.includeEmoji, formatOptions.precision) : '',
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
function formatDiff(percentDiff, higherIsBetter = false, includeEmoji = true, precision) {
    const percentString = format(percentDiff * 100, precision, '%', true);
    const valueToCompare = higherIsBetter ? percentDiff * -1 : percentDiff;
    if (valueToCompare > common_1.config.comparison.percentDiffSevereThreshold) {
        return `**${percentString}**&nbsp;🚨`;
    }
    if (valueToCompare > common_1.config.comparison.percentDiffWarningThreshold) {
        return `**${percentString}**&nbsp;🔸`;
    }
    if (valueToCompare < common_1.config.comparison.percentDiffGoldStarThreshold) {
        return `**${percentString}**&nbsp;🌟`;
    }
    return percentString;
}
function format(x, precision = 1, unit = '', showPlusSign) {
    switch (typeof x) {
        case 'string': return x + unit;
        case 'number':
            if (isNaN(x))
                return '';
            let numString = x.toFixed(precision).replace(/^-0(\.0*)?$/, '0$1');
            if (showPlusSign && !/^0(\.0*)?$/.test(numString))
                numString = `+${numString}`;
            return numString + unit;
        default: return '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlVGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZ2l0aHViL2NyZWF0ZVRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsb0VBQW1DO0FBQ25DLHNDQUFzRjtBQUN0Rix1Q0FBMkQ7QUFFM0QsU0FBZ0IscUJBQXFCLENBQUMsTUFBeUMsRUFBRSxLQUF3QyxFQUFFLFdBQW1CLEVBQUUsVUFBa0I7SUFDaEssT0FBTyx3QkFBSyxDQUFDO1FBQ1gsQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUM7UUFDckMsQ0FBQyx1QkFBdUIsQ0FBQztRQUN6QixxRUFBcUU7UUFDckUsNkJBQTZCLENBQUMsaUJBQU8sQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztRQUMvRCw2QkFBNkIsQ0FBQyxpQkFBTyxDQUFDLHNCQUFzQixFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDNUUsNkJBQTZCLENBQUMsaUJBQU8sQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO1FBQ3RFLDZCQUE2QixDQUFDLGlCQUFPLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQztRQUN2RSxFQUFFO1FBQ0YsQ0FBQyxzQkFBc0IsQ0FBQztRQUN4Qiw2QkFBNkIsQ0FBQyxpQkFBTyxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO1FBQ2xFLDZCQUE2QixDQUFDLGlCQUFPLENBQUMsZUFBZSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7UUFDckUsQ0FBQyxnQ0FBZ0MsQ0FBQztRQUNsQyw2QkFBNkIsQ0FBQyxpQkFBTyxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ3BGLDZCQUE2QixDQUFDLGlCQUFPLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLEtBQUss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