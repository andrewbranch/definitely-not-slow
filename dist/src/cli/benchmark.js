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
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
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
const analysis_1 = require("../analysis");
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
        tsVersion: common_1.withDefault(args.tsVersion, 'next').toString(),
        progress: common_1.assertBoolean(common_1.withDefault(args.progress, false), 'progress'),
        iterations: common_1.assertNumber(common_1.withDefault(args.iterations, 5), 'iterations'),
        nProcesses: common_1.assertNumber(common_1.withDefault(args.nProcesses, os.cpus().length), 'nProcesses'),
        maxRunSeconds: args.maxRunSeconds ? common_1.assertNumber(args.maxRunSeconds, 'maxRunSeconds') : undefined,
        printSummary: common_1.assertBoolean(common_1.withDefault(args.printSummary, true), 'printSummary'),
        definitelyTypedPath: path.resolve(common_1.assertString(common_1.withDefault(args.definitelyTypedPath, process.cwd()), 'definitelyTypedPath')),
        failOnErrors: true,
        installTypeScript: true,
        localTypeScriptPath: common_1.assertString(common_1.withDefault(args.localTypeScriptPath, path.resolve('built/local')), 'localTypeScriptPath'),
        reverse: !!args.reverse,
    };
}
function benchmark(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = convertArgs(args);
        const time = new Date();
        if (options.groups) {
            let group = options.groups[common_1.assertNumber(options.agentIndex, 'agentIndex')];
            if (options.reverse) {
                group = group.reverse();
            }
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
        const { upload, progress, iterations, nProcesses, tsVersion, maxRunSeconds, printSummary: shouldPrintSummary, definitelyTypedPath, failOnErrors, installTypeScript, localTypeScriptPath, } = options;
        const version = packageVersion ? parseInt(packageVersion.replace(/^v/, ''), 10) || '*' : '*';
        const { allPackages } = yield common_1.getParsedPackages(definitelyTypedPath);
        if (!allPackages.tryGetTypingsData({ name: packageName, majorVersion: version })) {
            return undefined;
        }
        const { ts, tsPath } = yield getTypeScript_1.getTypeScript(tsVersion.toString(), localTypeScriptPath, installTypeScript);
        const benchmark = yield measure_1.measurePerf({
            packageName,
            packageVersion: version.toString(),
            allPackages,
            iterations,
            progress,
            definitelyTypedRootPath: definitelyTypedPath,
            typeScriptVersion: ts.version,
            maxRunSeconds,
            nProcesses,
            tsPath,
            ts,
            batchRunStart,
            failOnErrors,
        });
        const summary = analysis_1.summarize(benchmark);
        if (shouldPrintSummary) {
            measure_1.printSummary([summary]);
        }
        if (upload) {
            const { packageBenchmarks } = yield common_1.getDatabase("write" /* Write */);
            const item = yield write_1.insertDocument(summary, common_1.config.database.packageBenchmarksDocumentSchemaVersion, packageBenchmarks);
            return { benchmark, summary, id: item.id };
        }
        return { benchmark, summary, id: undefined };
    });
}
exports.benchmarkPackage = benchmarkPackage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVuY2htYXJrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaS9iZW5jaG1hcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0Isc0NBQStKO0FBQy9KLDREQUF5RDtBQUN6RCxvQ0FBMEM7QUFDMUMsd0NBQXVEO0FBR3ZELDBDQUF3QztBQUN4QyxNQUFNLGFBQWEsR0FBRyxzQkFBYSxFQUFFLENBQUM7QUFvQnRDLFNBQVMsV0FBVyxDQUFDLEVBQXVCO1FBQXZCLEVBQUUsSUFBSSxPQUFpQixFQUFmLDJCQUFPO0lBQ2xDLElBQUksSUFBSSxFQUFFO1FBQ1IsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssYUFBYSxDQUFDLElBQUksRUFBRTtZQUNuRCxPQUFPLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6RSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNwRTtRQUNELHVCQUNFLE1BQU0sRUFBRSxZQUFZLENBQUMsTUFBTSxJQUN4QixXQUFXLG1CQUFNLFlBQVksQ0FBQyxPQUFPLEVBQUssSUFB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