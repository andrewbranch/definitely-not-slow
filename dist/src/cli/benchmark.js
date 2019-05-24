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
        maxRunSeconds: args.maxRunSeconds ? common_1.assertNumber(args.maxRunSeconds, 'maxRunSeconds') : undefined,
        printSummary: common_1.assertBoolean(common_1.withDefault(args.printSummary, true), 'printSummary'),
        definitelyTypedPath: path.resolve(common_1.assertString(common_1.withDefault(args.definitelyTypedPath, process.cwd()), 'definitelyTypedPath')),
        failOnErrors: true,
        installTypeScript: true,
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
        const { upload, progress, iterations, nProcesses, tsVersion, maxRunSeconds, printSummary: shouldPrintSummary, definitelyTypedPath, failOnErrors, installTypeScript, } = options;
        const { ts, tsPath } = yield getTypeScript_1.getTypeScript(tsVersion.toString(), undefined, installTypeScript);
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
            maxRunSeconds,
            nProcesses,
            tsPath,
            ts,
            batchRunStart,
            failOnErrors,
        });
        const summaries = benchmarks.map(measure_1.summarize);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVuY2htYXJrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaS9iZW5jaG1hcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLHNDQUErSjtBQUMvSiw0REFBeUQ7QUFDekQsb0NBQWtEO0FBQ2xELHdDQUFrRTtBQUdsRSxNQUFNLGFBQWEsR0FBRyxzQkFBYSxFQUFFLENBQUM7QUFrQnRDLFNBQVMsV0FBVyxDQUFDLEVBQXVCO1FBQXZCLEVBQUUsSUFBSSxPQUFpQixFQUFmLDJCQUFPO0lBQ2xDLElBQUksSUFBSSxFQUFFO1FBQ1IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssYUFBYSxDQUFDLElBQUksRUFBRTtZQUNuRCxPQUFPLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6RSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNwRTtRQUNELHVCQUNFLE1BQU0sRUFBRSxZQUFZLENBQUMsTUFBTSxJQUN4QixXQUFXLG1CQUFNLFlBQVksQ0FBQyxPQUFPLEVBQUssSUFBSSxFQUFHLElBQ3BELFlB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