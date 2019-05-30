"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
function summarize(benchmark) {
    return Object.assign({ packageName: benchmark.packageName, packageVersion: benchmark.packageVersion, typeScriptVersion: benchmark.typeScriptVersion, typeScriptVersionMajorMinor: benchmark.typeScriptVersionMajorMinor, sourceVersion: benchmark.sourceVersion, typeCount: benchmark.typeCount, memoryUsage: benchmark.memoryUsage, relationCacheSizes: benchmark.relationCacheSizes, benchmarkDuration: benchmark.benchmarkDuration, batchRunStart: benchmark.batchRunStart, testIdentifierCount: benchmark.testIdentifierCount, requestedLanguageServiceTestIterations: benchmark.requestedLanguageServiceTestIterations, languageServiceCrashed: benchmark.languageServiceCrashed }, summarizeStats(benchmark.languageServiceBenchmarks));
}
exports.summarize = summarize;
function summarizeStats(benchmarks) {
    return [
        ['completions', (benchmark) => benchmark.completionsDurations],
        ['quickInfo', (benchmark) => benchmark.quickInfoDurations],
    ].reduce((acc, [key, getDurations]) => {
        const durations = Array.prototype.concat.apply([], benchmarks.map(getDurations));
        const worst = utils_1.max(benchmarks, m => utils_1.mean(getDurations(m)));
        const stats = {
            mean: utils_1.mean(durations),
            median: utils_1.median(durations),
            standardDeviation: utils_1.stdDev(durations),
            trials: durations.length,
            worst,
        };
        return Object.assign({}, acc, { [key]: stats });
    }, {});
}
exports.summarizeStats = summarizeStats;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21lYXN1cmUvc3VtbWFyaXplLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUNBQW9EO0FBRXBELFNBQWdCLFNBQVMsQ0FBQyxTQUEyQjtJQUNuRCx1QkFDRSxXQUFXLEVBQUUsU0FBUyxDQUFDLFdBQVcsRUFDbEMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxjQUFjLEVBQ3hDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxpQkFBaUIsRUFDOUMsMkJBQTJCLEVBQUUsU0FBUyxDQUFDLDJCQUEyQixFQUNsRSxhQUFhLEVBQUUsU0FBUyxDQUFDLGFBQWEsRUFDdEMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxTQUFTLEVBQzlCLFdBQVcsRUFBRSxTQUFTLENBQUMsV0FBVyxFQUNsQyxrQkFBa0IsRUFBRSxTQUFTLENBQUMsa0JBQWtCLEVBQ2hELGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxpQkFBaUIsRUFDOUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxhQUFhLEVBQ3RDLG1CQUFtQixFQUFFLFNBQVMsQ0FBQyxtQkFBbUIsRUFDbEQsc0NBQXNDLEVBQUUsU0FBUyxDQUFDLHNDQUFzQyxFQUN4RixzQkFBc0IsRUFBRSxTQUFTLENBQUMsc0JBQXNCLElBQ3JELGNBQWMsQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUMsRUFDdkQ7QUFDSCxDQUFDO0FBakJELDhCQWlCQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxVQUFzQztJQUluRSxPQUFPO1FBQ0wsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxTQUFtQyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQVU7UUFDakcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFtQyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQVU7S0FDOUYsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLEVBQUUsRUFBRTtRQUNwQyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUNqRixNQUFNLEtBQUssR0FBRyxXQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUQsTUFBTSxLQUFLLEdBQTBDO1lBQ25ELElBQUksRUFBRSxZQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3JCLE1BQU0sRUFBRSxjQUFNLENBQUMsU0FBUyxDQUFDO1lBQ3pCLGlCQUFpQixFQUFFLGNBQU0sQ0FBQyxTQUFTLENBQUM7WUFDcEMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNO1lBQ3hCLEtBQUs7U0FDTixDQUFDO1FBRUYseUJBQ0ssR0FBRyxJQUNOLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxJQUNaO0lBQ0osQ0FBQyxFQUFFLEVBQWdGLENBQUMsQ0FBQztBQUN2RixDQUFDO0FBdkJELHdDQXVCQyJ9