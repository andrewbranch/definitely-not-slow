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
const currentSystem = common_1.getSystemInfo();
function convertArgs(_a) {
    var { file } = _a, args = __rest(_a, ["file"]);
    if (file) {
        const fileContents = require(path.resolve(common_1.assertString(file, 'file')));
        if (fileContents.system.hash !== currentSystem.hash) {
            console.error('Systems mismatch; needed:');
            console.error(JSON.stringify(fileContents.system, undefined, 2) + os.EOL);
            console.error('Current:');
            console.error(JSON.stringify(currentSystem, undefined, 2) + os.EOL);
            throw new Error('Systems mismatch; see logs for details');
        }
        return Object.assign({ groups: fileContents.groups }, convertArgs(Object.assign({}, fileContents.options, args)));
    }
    return {
        package: args.package ? common_1.assertString(args.package) : undefined,
        agentIndex: typeof args.agentIndex !== 'undefined' ? common_1.assertNumber(args.agentIndex, 'agentIndex') : undefined,
        upload: common_1.assertBoolean(common_1.withDefault(args.upload, true), 'upload'),
        tsVersion: common_1.assertString(common_1.withDefault(args.tsVersion, 'next')),
        progress: common_1.assertBoolean(common_1.withDefault(args.progress, true), 'progress'),
        iterations: common_1.assertNumber(common_1.withDefault(args.iterations, 5), 'iterations'),
        nProcesses: common_1.assertNumber(common_1.withDefault(args.nProcesses, os.cpus().length - 1), 'nProcesses'),
        maxLanguageServiceTestPositions: args.maxLanguageServiceTestPositions ? common_1.assertNumber(args.maxLanguageServiceTestPositions) : undefined,
        printSummary: common_1.assertBoolean(common_1.withDefault(args.printSummary, true), 'printSummary'),
        definitelyTypedPath: path.resolve(common_1.assertString(common_1.withDefault(args.definitelyTypedPath, process.cwd())), 'definitelyTypedPath'),
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
        const { upload, progress, iterations, nProcesses, tsVersion, maxLanguageServiceTestPositions, printSummary: shouldPrintSummary, definitelyTypedPath, } = options;
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
        const summaries = benchmarks.map(measure_1.summarize);
        if (shouldPrintSummary) {
            measure_1.printSummary(summaries);
        }
        if (upload) {
            const { container } = yield common_1.getDatabase("write" /* Write */);
            return Promise.all(summaries.map(summary => {
                return write_1.insertPackageBenchmark(summary, common_1.config.database.packageBenchmarksDocumentSchemaVersion, container);
            }));
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVuY2htYXJrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaS9iZW5jaG1hcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLHNDQUErSjtBQUMvSiw0REFBeUQ7QUFDekQsb0NBQWtEO0FBQ2xELHdDQUFrRTtBQUdsRSxNQUFNLGFBQWEsR0FBRyxzQkFBYSxFQUFFLENBQUM7QUFnQnRDLFNBQVMsV0FBVyxDQUFDLEVBQXVCO1FBQXZCLEVBQUUsSUFBSSxPQUFpQixFQUFmLDJCQUFPO0lBQ2xDLElBQUksSUFBSSxFQUFFO1FBQ1IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssYUFBYSxDQUFDLElBQUksRUFBRTtZQUNuRCxPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDM0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMxRSxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzFCLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwRSxNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7U0FDM0Q7UUFDRCx1QkFDRSxNQUFNLEVBQUUsWUFBWSxDQUFDLE1BQU0sSUFDeEIsV0FBVyxt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