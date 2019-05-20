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
        console.log(os.EOL);
        console.log(versionString);
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
        console.log('    Trials       ', `${completions.trials} (sampled from ${benchmark.testIdentifierCount})`);
        console.log('    Mean (ms):   ', toPrecision(completions.mean, 6));
        console.log('    Median (ms): ', toPrecision(completions.median, 6));
        console.log('    Worst');
        console.log('      Duration (ms):  ', toPrecision(utils_1.mean(worstCompletion.completionsDurations), 6));
        console.log('      Trials:         ', `${worstCompletion.completionsDurations.length} (wanted ${benchmark.requestedLanguageServiceTestIterations})`);
        console.log('      Std. deviation: ', toPrecision(utils_1.stdDev(worstCompletion.completionsDurations), 6));
        console.log('      Identifier:     ', worstCompletion.identifierText);
        console.log('      Location:       ', `${worstCompletion.fileName}(${worstCompletion.line},${worstCompletion.offset})`);
        console.log('  Quick Info');
        console.log('    Trials       ', `${quickInfo.trials} (sampled from ${benchmark.testIdentifierCount})`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbnRTdW1tYXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21lYXN1cmUvcHJpbnRTdW1tYXJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUV6QixtQ0FBdUM7QUFFdkMsU0FBUyxXQUFXLENBQUMsQ0FBUyxFQUFFLFNBQWlCO0lBQy9DLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDckQsQ0FBQztBQUVELFNBQWdCLFlBQVksQ0FBQyxTQUFvQztJQUMvRCxLQUFLLE1BQU0sU0FBUyxJQUFJLFNBQVMsRUFBRTtRQUNqQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUM3QyxNQUFNLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxHQUFHLFdBQVcsQ0FBQztRQUMvQyxNQUFNLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUM1QyxNQUFNLGFBQWEsR0FBRyxXQUFXLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUM1RCxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixFQUFFLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzVELElBQUksU0FBUyxDQUFDLGtCQUFrQixFQUFFO1lBQ2hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxTQUFTLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDNUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxTQUFTLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxTQUFTLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDMUU7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxXQUFXLENBQUMsTUFBTSxrQkFBa0IsU0FBUyxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQztRQUMxRyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxXQUFXLENBQUMsWUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLFlBQVksU0FBUyxDQUFDLHNDQUFzQyxHQUFHLENBQUMsQ0FBQztRQUNySixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLFdBQVcsQ0FBQyxjQUFNLENBQUMsZUFBZSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRyxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN0RSxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLEdBQUcsZUFBZSxDQUFDLFFBQVEsSUFBSSxlQUFlLENBQUMsSUFBSSxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3hILE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLFNBQVMsQ0FBQyxNQUFNLGtCQUFrQixTQUFTLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO1FBQ3hHLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLFdBQVcsQ0FBQyxZQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRixPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixFQUFFLEdBQUcsZUFBZSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sWUFBWSxTQUFTLENBQUMsc0NBQXNDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JKLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsV0FBVyxDQUFDLGNBQU0sQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pHLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxjQUFjLENBQUMsUUFBUSxJQUFJLGNBQWMsQ0FBQyxJQUFJLElBQUksY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7S0FDdEg7QUFDSCxDQUFDO0FBdENELG9DQXNDQyJ9