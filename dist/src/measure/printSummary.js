"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(require("os"));
const utils_1 = require("./utils");
function toPrecision(n, precision) {
    return isNaN(n) ? 'N/A' : n.toPrecision(precision);
}
function printSummary(summaries) {
    for (const benchmark of summaries) {
        const { quickInfo, completions } = benchmark;
        const { worst: worstCompletion } = completions;
        const { worst: worstQuickInfo } = quickInfo;
        const versionString = `Version ${benchmark.packageVersion}`;
        console.log(os.EOL + versionString);
        console.log('-'.repeat(versionString.length));
        console.log('  Total duration (ms): ', benchmark.benchmarkDuration);
        console.log('  Type count:          ', benchmark.typeCount);
        if (benchmark.relationCacheSizes) {
            console.log('  Cache sizes');
            console.log('    Assignability: ', benchmark.relationCacheSizes.assignable);
            console.log('    Identity:      ', benchmark.relationCacheSizes.identity);
            console.log('    Subtype:       ', benchmark.relationCacheSizes.subtype);
        }
        console.log('  Completions');
        console.log('    Trials       ', `${completions.trials} (sampled from ${benchmark.testIdentifierCount * benchmark.requestedLanguageServiceTestIterations})`);
        console.log('    Mean (ms):   ', toPrecision(completions.mean, 6));
        console.log('    Median (ms): ', toPrecision(completions.median, 6));
        console.log('    Worst');
        console.log('      Duration (ms):  ', toPrecision(utils_1.mean(worstCompletion.completionsDurations), 6));
        console.log('      Trials:         ', `${worstCompletion.completionsDurations.length} (wanted ${benchmark.requestedLanguageServiceTestIterations})`);
        console.log('      Std. deviation: ', toPrecision(utils_1.stdDev(worstCompletion.completionsDurations), 6));
        console.log('      Identifier:     ', worstCompletion.identifierText);
        console.log('      Location:       ', `${worstCompletion.fileName}(${worstCompletion.line},${worstCompletion.offset})`);
        console.log('  Quick Info');
        console.log('    Trials       ', `${quickInfo.trials} (sampled from ${benchmark.testIdentifierCount * benchmark.requestedLanguageServiceTestIterations})`);
        console.log('    Mean (ms):   ', toPrecision(quickInfo.mean, 6));
        console.log('    Median (ms): ', toPrecision(quickInfo.median, 6));
        console.log('    Worst');
        console.log('      Duration (ms):  ', toPrecision(utils_1.mean(worstQuickInfo.quickInfoDurations), 6));
        console.log('      Trials:         ', `${worstCompletion.completionsDurations.length} (wanted ${benchmark.requestedLanguageServiceTestIterations})`);
        console.log('      Std. deviation: ', toPrecision(utils_1.stdDev(worstQuickInfo.quickInfoDurations), 6));
        console.log('      Identifier:     ', worstQuickInfo.identifierText);
        console.log('      Location:       ', `${worstQuickInfo.fileName}(${worstQuickInfo.line},${worstQuickInfo.offset})`);
    }
}
exports.printSummary = printSummary;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbnRTdW1tYXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21lYXN1cmUvcHJpbnRTdW1tYXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUV6QixtQ0FBdUM7QUFFdkMsU0FBUyxXQUFXLENBQUMsQ0FBUyxFQUFFLFNBQWlCO0lBQy9DLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDckQsQ0FBQztBQUVELFNBQWdCLFlBQVksQ0FBQyxTQUFvQztJQUMvRCxLQUFLLE1BQU0sU0FBUyxJQUFJLFNBQVMsRUFBRTtRQUNqQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUM3QyxNQUFNLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxHQUFHLFdBQVcsQ0FBQztRQUMvQyxNQUFNLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUM1QyxNQUFNLGFBQWEsR0FBRyxXQUFXLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUM1RCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsYUFBYSxDQUFDLENBQUM7UUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDcEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDNUQsSUFBSSxTQUFTLENBQUMsa0JBQWtCLEVBQUU7WUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FB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