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
const getParsedCommandLineForPackage_1 = require("./getParsedCommandLineForPackage");
const createLanguageServiceHost_1 = require("./createLanguageServiceHost");
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
        if (isMeasureLanguageServiceArgs(message)) {
            if (!ts || !commandLine || !languageServiceHost || !languageService) {
                ts = (yield Promise.resolve().then(() => __importStar(require(message.tsPath))));
                commandLine = getParsedCommandLineForPackage_1.getParsedCommandLineForPackage(ts, message.packageDirectory);
                languageServiceHost = createLanguageServiceHost_1.createLanguageServiceHost(ts, commandLine.options, commandLine.fileNames);
                languageService = ts.createLanguageService(languageServiceHost);
                // Warm up - make sure functions are compiled
                getCompletionsAtPosition(languageService, message.fileName, message.start);
                getQuickInfoAtPosition(languageService, message.fileName, message.start);
            }
            const positionMeasurement = yield measureLanguageService(languageService, message);
            process.send(positionMeasurement);
        }
        else {
            throw new Error('Invalid command-line arguments');
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVhc3VyZUxhbmd1YWdlU2VydmljZVdvcmtlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tZWFzdXJlL21lYXN1cmVMYW5ndWFnZVNlcnZpY2VXb3JrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQ0FBaUM7QUFDakMsMkNBQThEO0FBRTlELHFGQUFrRjtBQUNsRiwyRUFBd0U7QUFFM0QsUUFBQSxvQ0FBb0MsR0FBRyxVQUFVLENBQUM7QUFXL0QsU0FBUyw0QkFBNEIsQ0FBQyxDQUFNO0lBQzFDLE9BQU8sSUFBSSxDQUFDLENBQUMsV0FBVztBQUMxQixDQUFDO0FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7SUFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7UUFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0tBQ2hFO0lBRUQsSUFBSSxFQUEyQyxDQUFDO0lBQ2hELElBQUksV0FBMEMsQ0FBQztJQUMvQyxJQUFJLG1CQUFvRCxDQUFDO0lBQ3pELElBQUksZUFBNEMsQ0FBQztJQUVqRCxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFPLE9BQWdCLEVBQUUsRUFBRTtRQUMvQyxJQUFJLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3pDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDbkUsRUFBRSxJQUFHLHdEQUFhLE9BQU8sQ0FBQyxNQUFNLEdBQWdDLENBQUEsQ0FBQztnQkFDakUsV0FBVyxHQUFHLCtEQUE4QixDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDM0UsbUJBQW1CLEdBQUcscURBQXlCLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLFNB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