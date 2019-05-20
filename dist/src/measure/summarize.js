"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
function summarize(benchmark) {
    return Object.assign({ packageName: benchmark.packageName, packageVersion: benchmark.packageVersion, typeScriptVersion: benchmark.typeScriptVersion, typeScriptVersionMajorMinor: benchmark.typeScriptVersionMajorMinor, sourceVersion: benchmark.sourceVersion, typeCount: benchmark.typeCount, relationCacheSizes: benchmark.relationCacheSizes, benchmarkDuration: benchmark.benchmarkDuration, batchRunStart: benchmark.batchRunStart, testIdentifierCount: benchmark.testIdentifierCount, requestedLanguageServiceTestIterations: benchmark.requestedLanguageServiceTestIterations }, summarizeStats(benchmark.languageServiceBenchmarks));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyaXplLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21lYXN1cmUvc3VtbWFyaXplLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsbUNBQW9EO0FBRXBELFNBQWdCLFNBQVMsQ0FBQyxTQUEyQjtJQUNuRCx1QkFDRSxXQUFXLEVBQUUsU0FBUyxDQUFDLFdBQVcsRUFDbEMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxjQUFjLEVBQ3hDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxpQkFBaUIsRUFDOUMsMkJBQTJCLEVBQUUsU0FBUyxDQUFDLDJCQUEyQixFQUNsRSxhQUFhLEVBQUUsU0FBUyxDQUFDLGFBQWEsRUFDdEMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxTQUFTLEVBQzlCLGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxrQkFBa0IsRUFDaEQsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLGlCQUFpQixFQUM5QyxhQUFhLEVBQUUsU0FBUyxDQUFDLGFBQWEsRUFDdEMsbUJBQW1CLEVBQUUsU0FBUyxDQUFDLG1CQUFtQixFQUNsRCxzQ0FBc0MsRUFBRSxTQUFTLENBQUMsc0NBQXNDLElBQ3JGLGNBQWMsQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUMsRUFDdkQ7QUFDSCxDQUFDO0FBZkQsOEJBZUM7QUFFRCxTQUFnQixjQUFjLENBQUMsVUFBc0M7SUFJbkUsT0FBTztRQUNMLENBQUMsYUFBYSxFQUFFLENBQUMsU0FBbUMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFVO1FBQ2pHLENBQUMsV0FBVyxFQUFFLENBQUMsU0FBbUMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFVO0tBQzlGLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLFlBQVksQ0FBQyxFQUFFLEVBQUU7UUFDcEMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDakYsTUFBTSxLQUFLLEdBQUcsV0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFlBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFELE1BQU0sS0FBSyxHQUEwQztZQUNuRCxJQUFJLEVBQUUsWUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNyQixNQUFNLEVBQUUsY0FBTSxDQUFDLFNBQVMsQ0FBQztZQUN6QixpQkFBaUIsRUFBRSxjQUFNLENBQUMsU0FBUyxDQUFDO1lBQ3BDLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTTtZQUN4QixLQUFLO1NBQ04sQ0FBQztRQUVGLHlCQUNLLEdBQUcsSUFDTixDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssSUFDWjtJQUNKLENBQUMsRUFBRSxFQUFnRixDQUFDLENBQUM7QUFDdkYsQ0FBQztBQXZCRCx3Q0F1QkMifQ==