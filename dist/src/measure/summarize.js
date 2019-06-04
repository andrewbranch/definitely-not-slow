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
        const [means, cvs] = benchmarks.map(b => {
            const durations = getDurations(b);
            return [utils_1.mean(durations), utils_1.coefficientOfVariation(durations)];
        });
        const worst = utils_1.max(benchmarks, b => utils_1.mean(getDurations(b)));
        const stats = {
            mean: utils_1.mean(means),
            median: utils_1.median(means),
            standardDeviation: utils_1.stdDev(means),
            meanCoefficientOfVariation: utils_1.mean(cvs),
            trials: means.length,
            worst,
        };
        return Object.assign({}, acc, { [key]: stats });
    }, {});
}
exports.summarizeStats = summarizeStats;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21lYXN1cmUvc3VtbWFyaXplLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUNBQTRFO0FBRTVFLFNBQWdCLFNBQVMsQ0FBQyxTQUEyQjtJQUNuRCx1QkFDRSxXQUFXLEVBQUUsU0FBUyxDQUFDLFdBQVcsRUFDbEMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxjQUFjLEVBQ3hDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxpQkFBaUIsRUFDOUMsMkJBQTJCLEVBQUUsU0FBUyxDQUFDLDJCQUEyQixFQUNsRSxhQUFhLEVBQUUsU0FBUyxDQUFDLGFBQWEsRUFDdEMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxTQUFTLEVBQzlCLFdBQVcsRUFBRSxTQUFTLENBQUMsV0FBVyxFQUNsQyxrQkFBa0IsRUFBRSxTQUFTLENBQUMsa0JBQWtCLEVBQ2hELGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxpQkFBaUIsRUFDOUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxhQUFhLEVBQ3RDLG1CQUFtQixFQUFFLFNBQVMsQ0FBQyxtQkFBbUIsRUFDbEQsc0NBQXNDLEVBQUUsU0FBUyxDQUFDLHNDQUFzQyxFQUN4RixzQkFBc0IsRUFBRSxTQUFTLENBQUMsc0JBQXNCLElBQ3JELGNBQWMsQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUMsRUFDdkQ7QUFDSCxDQUFDO0FBakJELDhCQWlCQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxVQUFzQztJQUNuRSxPQUFPO1FBQ0wsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxTQUFtQyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQVU7UUFDakcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxTQUFtQyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQVU7S0FDOUYsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLEVBQUUsRUFBRTtRQUNwQyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdEMsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLE9BQU8sQ0FBQyxZQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsOEJBQXNCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUM5RCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sS0FBSyxHQUFHLFdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRCxNQUFNLEtBQUssR0FBMEM7WUFDbkQsSUFBSSxFQUFFLFlBQUksQ0FBQyxLQUFLLENBQUM7WUFDakIsTUFBTSxFQUFFLGNBQU0sQ0FBQyxLQUFLLENBQUM7WUFDckIsaUJBQWlCLEVBQUUsY0FBTSxDQUFDLEtBQUssQ0FBQztZQUNoQywwQkFBMEIsRUFBRSxZQUFJLENBQUMsR0FBRyxDQUFDO1lBQ3JDLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNwQixLQUFLO1NBQ04sQ0FBQztRQUVGLHlCQUNLLEdBQUcsSUFDTixDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssSUFDWjtJQUNKLENBQUMsRUFBRSxFQUFnRixDQUFDLENBQUM7QUFDdkYsQ0FBQztBQXhCRCx3Q0F3QkMifQ==