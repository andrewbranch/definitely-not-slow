"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const perf_hooks_1 = require("perf_hooks");
exports.measureLanguageServiceWorkerFilename = __filename;
function isMeasureLanguageServiceArgs(_) {
    return true; // Whatever
}
if (!module.parent) {
    if (!process.send) {
        throw new Error('Process was not started as a forked process');
    }
    let ts;
    let commandLine;
    let languageServiceHost;
    let languageService;
    process.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
        throw new Error('blah');
        // for (const args of message) {
        //   if (isMeasureLanguageServiceArgs(args)) {
        //     if (!ts || !commandLine || !languageServiceHost || !languageService) {
        //       ts = await import(args.tsPath) as typeof import('typescript');
        //       commandLine = getParsedCommandLineForPackage(ts, args.packageDirectory);
        //       languageServiceHost = createLanguageServiceHost(ts, commandLine.options, commandLine.fileNames);
        //       languageService = ts.createLanguageService(languageServiceHost);
        //       // Warm up - make sure functions are compiled
        //       getCompletionsAtPosition(languageService, args.fileName, args.start);
        //       getQuickInfoAtPosition(languageService, args.fileName, args.start);
        //     }
        //     const positionMeasurement = await measureLanguageService(languageService, args);
        //     process.send!(positionMeasurement);
        //   } else {
        //     throw new Error('Invalid command-line arguments');
        //   }
        // }
    }));
    process.on('unhandledRejection', (err) => {
        console.error(err);
        process.exit(1);
    });
}
function measureLanguageService(languageService, args) {
    return __awaiter(this, void 0, void 0, function* () {
        return Object.assign({ fileName: args.fileName, start: args.start }, measureAtPosition(args.fileName, args.start));
        function measureAtPosition(fileName, position) {
            let quickInfoDuration = NaN;
            let completionsDuration = NaN;
            const observer = new perf_hooks_1.PerformanceObserver((list) => {
                const completionsMeasurement = list.getEntriesByName('completionsMeasurement')[0];
                const quickInfoMeasurement = list.getEntriesByName('quickInfoMeasurement')[0];
                if (completionsMeasurement) {
                    completionsDuration = completionsMeasurement.duration;
                }
                if (quickInfoMeasurement) {
                    quickInfoDuration = quickInfoMeasurement.duration;
                }
            });
            observer.observe({ entryTypes: ['measure'] });
            getCompletionsAtPosition(languageService, fileName, position);
            getQuickInfoAtPosition(languageService, fileName, position);
            assert.ok(!isNaN(quickInfoDuration), 'No measurement was recorded for quick info');
            assert.ok(!isNaN(completionsDuration), 'No measurement was recorded for completions');
            observer.disconnect();
            return {
                quickInfoDuration,
                completionsDuration,
            };
        }
    });
}
function getCompletionsAtPosition(languageService, fileName, pos) {
    perf_hooks_1.performance.mark('beforeCompletions');
    const completions = languageService.getCompletionsAtPosition(fileName, pos, undefined);
    perf_hooks_1.performance.mark('afterCompletions');
    perf_hooks_1.performance.measure('completionsMeasurement', 'beforeCompletions', 'afterCompletions');
    return !!completions && completions.entries.length > 0;
}
function getQuickInfoAtPosition(languageService, fileName, pos) {
    perf_hooks_1.performance.mark('beforeQuickInfo');
    const quickInfo = languageService.getQuickInfoAtPosition(fileName, pos);
    perf_hooks_1.performance.mark('afterQuickInfo');
    perf_hooks_1.performance.measure('quickInfoMeasurement', 'beforeQuickInfo', 'afterQuickInfo');
    return !!quickInfo;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVhc3VyZUxhbmd1YWdlU2VydmljZVdvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tZWFzdXJlL21lYXN1cmVMYW5ndWFnZVNlcnZpY2VXb3JrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQ0FBaUM7QUFDakMsMkNBQThEO0FBS2pELFFBQUEsb0NBQW9DLEdBQUcsVUFBVSxDQUFDO0FBVy9ELFNBQVMsNEJBQTRCLENBQUMsQ0FBTTtJQUMxQyxPQUFPLElBQUksQ0FBQyxDQUFDLFdBQVc7QUFDMUIsQ0FBQztBQUVELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO0lBQ2xCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO1FBQ2pCLE1BQU0sSUFBSSxLQUFLLENBQUMsNkNBQTZDLENBQUMsQ0FBQztLQUNoRTtJQUVELElBQUksRUFBMkMsQ0FBQztJQUNoRCxJQUFJLFdBQTBDLENBQUM7SUFDL0MsSUFBSSxtQkFBb0QsQ0FBQztJQUN6RCxJQUFJLGVBQTRDLENBQUM7SUFFakQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBTyxPQUFrQixFQUFFLEVBQUU7UUFDakQsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QixnQ0FBZ0M7UUFDaEMsOENBQThDO1FBQzlDLDZFQUE2RTtRQUM3RSx1RUFBdUU7UUFDdkUsaUZBQWlGO1FBQ2pGLHlHQUF5RztRQUN6Ryx5RUFBeUU7UUFDekUsc0RBQXNEO1FBQ3RELDhFQUE4RTtRQUM5RSw0RUFBNEU7UUFDNUUsUUFBUTtRQUVSLHVGQUF1RjtRQUN2RiwwQ0FBMEM7UUFDMUMsYUFBYTtRQUNiLHlEQUF5RDtRQUN6RCxNQUFNO1FBQ04sSUFBSTtJQUNOLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFFSCxPQUFPLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUMsQ0FBQyxDQUFDO0NBQ0o7QUFFRCxTQUFlLHNCQUFzQixDQUFDLGVBQWdDLEVBQUUsSUFBZ0M7O1FBQ3RHLHVCQUNFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUN2QixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssSUFDZCxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFDL0M7UUFFRixTQUFTLGlCQUFpQixDQUN4QixRQUFnQixFQUNoQixRQUFnQjtZQUdoQixJQUFJLGlCQUFpQixHQUFHLEdBQUcsQ0FBQztZQUM1QixJQUFJLG1CQUFtQixHQUFHLEdBQUcsQ0FBQztZQUM5QixNQUFNLFFBQVEsR0FBRyxJQUFJLGdDQUFtQixDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ2hELE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xGLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlFLElBQUksc0JBQXNCLEVBQUU7b0JBQzFCLG1CQUFtQixHQUFHLHNCQUFzQixDQUFDLFFBQVEsQ0FBQztpQkFDdkQ7Z0JBQ0QsSUFBSSxvQkFBb0IsRUFBRTtvQkFDeEIsaUJBQWlCLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUFDO2lCQUNuRDtZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM5Qyx3QkFBd0IsQ0FBQyxlQUFlLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzlELHNCQUFzQixDQUFDLGVBQWUsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLDRDQUE0QyxDQUFDLENBQUM7WUFDbkYsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLDZDQUE2QyxDQUFDLENBQUM7WUFDdEYsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRXRCLE9BQU87Z0JBQ0wsaUJBQWlCO2dCQUNqQixtQkFBbUI7YUFDcEIsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0NBQUE7QUFFRCxTQUFTLHdCQUF3QixDQUFDLGVBQWdDLEVBQUUsUUFBZ0IsRUFBRSxHQUFXO0lBQy9GLHdCQUFXLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDdEMsTUFBTSxXQUFXLEdBQUcsZUFBZSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDdkYsd0JBQVcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNyQyx3QkFBVyxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxtQkFBbUIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3ZGLE9BQU8sQ0FBQyxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDekQsQ0FBQztBQUVELFNBQVMsc0JBQXNCLENBQUMsZUFBZ0MsRUFBRSxRQUFnQixFQUFFLEdBQVc7SUFDN0Ysd0JBQVcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNwQyxNQUFNLFNBQVMsR0FBRyxlQUFlLENBQUMsc0JBQXNCLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hFLHdCQUFXLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDbkMsd0JBQVcsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUNqRixPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDckIsQ0FBQyJ9