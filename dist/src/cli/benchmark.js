"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const common_1 = require("../common");
const getTypeScript_1 = require("../measure/getTypeScript");
const write_1 = require("../write");
const measure_1 = require("../measure");
const validate_1 = require("../measure/validate");
const currentSystem = common_1.getSystemInfo();
function convertArgs(_a) {
    var { file } = _a, args = __rest(_a, ["file"]);
    if (file) {
        const fileContents = require(path.resolve(common_1.assertString(file, 'file')));
        if (fileContents.system.hash !== currentSystem.hash) {
            console.warn('Systems mismatch; requested:');
            console.warn(JSON.stringify(fileContents.system, undefined, 2) + os.EOL);
            console.warn('Current:');
            console.warn(JSON.stringify(currentSystem, undefined, 2) + os.EOL);
        }
        return Object.assign({ groups: fileContents.groups }, convertArgs(Object.assign({}, fileContents.options, args)), { failOnErrors: false });
    }
    return {
        package: args.package ? common_1.assertString(args.package) : undefined,
        agentIndex: typeof args.agentIndex !== 'undefined' ? common_1.assertNumber(args.agentIndex, 'agentIndex') : undefined,
        upload: common_1.assertBoolean(common_1.withDefault(args.upload, true), 'upload'),
        tsVersion: common_1.assertString(common_1.withDefault(args.tsVersion, 'next')),
        progress: common_1.assertBoolean(common_1.withDefault(args.progress, true), 'progress'),
        iterations: common_1.assertNumber(common_1.withDefault(args.iterations, 5), 'iterations'),
        nProcesses: common_1.assertNumber(common_1.withDefault(args.nProcesses, os.cpus().length), 'nProcesses'),
        maxLanguageServiceTestPositions: args.maxLanguageServiceTestPositions ? common_1.assertNumber(args.maxLanguageServiceTestPositions) : undefined,
        printSummary: common_1.assertBoolean(common_1.withDefault(args.printSummary, true), 'printSummary'),
        definitelyTypedPath: path.resolve(common_1.assertString(common_1.withDefault(args.definitelyTypedPath, process.cwd()), 'definitelyTypedPath')),
        failOnErrors: true,
    };
}
function benchmark(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = convertArgs(args);
        const time = new Date();
        if (options.groups) {
            const group = options.groups[common_1.assertNumber(options.agentIndex, 'agentIndex')];
            for (let i = 0; i < group.length; i++) {
                const packageId = group[i];
                const logString = `Benchmarking ${packageId.name}/${packageId.majorVersion} (${i + 1} of ${group.length})`;
                console.log(logString);
                console.log('='.repeat(logString.length) + os.EOL);
                yield benchmarkPackage(packageId.name, packageId.majorVersion.toString(), time, options);
            }
        }
        else {
            const [packageName, packageVersion] = common_1.assertString(options.package, 'package').split('/');
            yield benchmarkPackage(packageName, packageVersion, time, options);
        }
    });
}
exports.benchmark = benchmark;
function benchmarkPackage(packageName, packageVersion, batchRunStart, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { upload, progress, iterations, nProcesses, tsVersion, maxLanguageServiceTestPositions, printSummary: shouldPrintSummary, definitelyTypedPath, failOnErrors, } = options;
        const { ts, tsPath } = yield getTypeScript_1.getTypeScript(tsVersion.toString());
        const { allPackages, definitelyTypedFS } = yield common_1.getParsedPackages(definitelyTypedPath);
        const benchmarks = yield measure_1.measurePerf({
            packageName,
            packageVersion: packageVersion ? packageVersion.replace(/^v/, '') : undefined,
            allPackages,
            iterations,
            progress,
            definitelyTypedFS,
            definitelyTypedRootPath: definitelyTypedPath,
            typeScriptVersion: ts.version,
            maxLanguageServiceTestPositions,
            nProcesses,
            tsPath,
            ts,
            batchRunStart,
        });
        const summaries = benchmarks
            .filter(benchmark => {
            if (!validate_1.validateBenchmark(benchmark, iterations)) {
                const errorMessage = `Benchmark ${benchmark.packageName}/${benchmark.packageVersion} had errors.`
                    + upload ? ' It will not be uploaded.' : '';
                if (failOnErrors) {
                    throw new Error(errorMessage);
                }
                return false;
            }
            return true;
        })
            .map(measure_1.summarize);
        if (shouldPrintSummary) {
            measure_1.printSummary(summaries);
        }
        if (upload) {
            const { container } = yield common_1.getDatabase("write" /* Write */);
            yield Promise.all(summaries.map(summary => {
                return write_1.insertPackageBenchmark(summary, common_1.config.database.packageBenchmarksDocumentSchemaVersion, container);
            }));
        }
        return benchmarks;
    });
}
exports.benchmarkPackage = benchmarkPackage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVuY2htYXJrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaS9iZW5jaG1hcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLHNDQUErSjtBQUMvSiw0REFBeUQ7QUFDekQsb0NBQWtEO0FBQ2xELHdDQUFrRTtBQUdsRSxrREFBd0Q7QUFDeEQsTUFBTSxhQUFhLEdBQUcsc0JBQWEsRUFBRSxDQUFDO0FBaUJ0QyxTQUFTLFdBQVcsQ0FBQyxFQUF1QjtRQUF2QixFQUFFLElBQUksT0FBaUIsRUFBZiwyQkFBTztJQUNsQyxJQUFJLElBQUksRUFBRTtRQUNSLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLGFBQWEsQ0FBQyxJQUFJLEVBQUU7WUFDbkQsT0FBTyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekUsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDcEU7UUFDRCx1QkFDRSxNQUFNLEVBQUUsWUFBWSxDQUFDLE1BQU0sSUFDeEIsV0FBVyxtQkFBTSxZQUFZLENBQUMsT0FBTyxFQUFLLElBQUksRUFBRyxJQUNwRCxZQUFZLEVBQUUsS0FBSyxJQUNuQjtLQUNIO0lBRUQsT0FBTztRQUNMLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxxQkFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztRQUM5RCxVQUFVLEVBQUUsT0FBTyxJQUFJLENBQUMsVUFBVSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMscUJBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQzVHLE1BQU0sRUFBRSxzQkFBYSxDQUFDLG9CQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUM7UUFDL0QsU0FBUyxFQUFFLHFCQUFZLENBQUMsb0JBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzVELFFBQVEsRUFBRSxzQkFBYSxDQUFDLG9CQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsRUFBRSxVQUFVLENBQUM7UUFDckUsVUFBVSxFQUFFLHFCQUFZLENBQUMsb0JBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQztRQUN2RSxVQUFVLEVBQUUscUJBQVksQ0FBQyxvQkFBVyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFlBQVksQ0FBQztRQUN0RiwrQkFBK0IsRUFBRSxJQUFJLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDLHFCQUFZLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDdEksWUFBWSxFQUFFLHNCQUFhLENBQUMsb0JBQVcsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxFQUFFLGNBQWMsQ0FBQztRQUNqRixtQkFBbUIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFZLENBQUMsb0JBQVcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUM1SCxZQUFZLEVBQUUsSUFBSTtLQUNuQixDQUFDO0FBQ0osQ0FBQztBQUVELFNBQXNCLFNBQVMsQ0FBQyxJQUFVOztRQUN4QyxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN4QixJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDbEIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxxQkFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUM3RSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDckMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixNQUFNLFNBQVMsR0FBRyxnQkFBZ0IsU0FBUyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsWUFBWSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDO2dCQUMzRyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQzFGO1NBQ0Y7YUFBTTtZQUNMLE1BQU0sQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDLEdBQUcscUJBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxRixNQUFNLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3BFO0lBQ0gsQ0FBQztDQUFBO0FBaEJELDhCQWdCQztBQUVELFNBQXNCLGdCQUFnQixDQUFDLFdBQW1CLEVBQUUsY0FBc0IsRUFBRSxhQUFtQixFQUFFLE9BQWdDOztRQUN2SSxNQUFNLEVBQ0osTUFBTSxFQUNOLFFBQVEsRUFDUixVQUFVLEVBQ1YsVUFBVSxFQUNWLFNBQVMsRUFDVCwrQkFBK0IsRUFDL0IsWUFBWSxFQUFFLGtCQUFrQixFQUNoQyxtQkFBbUIsRUFDbkIsWUFBWSxHQUNiLEdBQUcsT0FBTyxDQUFDO1FBQ1osTUFBTSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLDZCQUFhLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDakUsTUFBTSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxHQUFHLE1BQU0sMEJBQWlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUN4RixNQUFNLFVBQVUsR0FBRyxNQUFNLHFCQUFXLENBQUM7WUFDbkMsV0FBVztZQUNYLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQzdFLFdBQVc7WUFDWCxVQUFVO1lBQ1YsUUFBUTtZQUNSLGlCQUFpQjtZQUNqQix1QkFBdUIsRUFBRSxtQkFBbUI7WUFDNUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLE9BQU87WUFDN0IsK0JBQStCO1lBQy9CLFVBQVU7WUFDVixNQUFNO1lBQ04sRUFBRTtZQUNGLGFBQWE7U0FDZCxDQUFDLENBQUM7UUFFSCxNQUFNLFNBQVMsR0FBRyxVQUFVO2FBQ3pCLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNsQixJQUFJLENBQUMsNEJBQWlCLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxFQUFFO2dCQUM3QyxNQUFNLFlBQVksR0FBRyxhQUFhLFNBQVMsQ0FBQyxXQUFXLElBQUksU0FBUyxDQUFDLGNBQWMsY0FBYztzQkFDN0YsTUFBTSxDQUFDLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM5QyxJQUFJLFlBQVksRUFBRTtvQkFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztpQkFDL0I7Z0JBQ0QsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQyxDQUFDO2FBQ0QsR0FBRyxDQUFDLG1CQUFTLENBQUMsQ0FBQztRQUVsQixJQUFJLGtCQUFrQixFQUFFO1lBQ3RCLHNCQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDekI7UUFFRCxJQUFJLE1BQU0sRUFBRTtZQUNWLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLG9CQUFXLHFCQUEyQixDQUFDO1lBQ25FLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN4QyxPQUFPLDhCQUFzQixDQUMzQixPQUFPLEVBQ1AsZUFBTSxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsRUFDdEQsU0FBUyxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ0w7UUFFRCxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0NBQUE7QUEzREQsNENBMkRDIn0=