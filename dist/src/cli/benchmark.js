"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
        return Object.assign(Object.assign({ groups: fileContents.groups }, convertArgs(Object.assign(Object.assign({}, fileContents.options), args))), { failOnErrors: false });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVuY2htYXJrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaS9iZW5jaG1hcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLHNDQUErSjtBQUMvSiw0REFBeUQ7QUFDekQsb0NBQTBDO0FBQzFDLHdDQUF1RDtBQUd2RCwwQ0FBd0M7QUFDeEMsTUFBTSxhQUFhLEdBQUcsc0JBQWEsRUFBRSxDQUFDO0FBb0J0QyxTQUFTLFdBQVcsQ0FBQyxFQUF1QjtRQUF2QixFQUFFLElBQUksT0FBaUIsRUFBZiwyQkFBTztJQUNsQyxJQUFJLElBQUksRUFBRTtRQUNSLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLGFBQWEsQ0FBQyxJQUFJLEVBQUU7WUFDbkQsT0FBTyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekUsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDcEU7UUFDRCxxQ0FDRSxNQUFNLEVBQUUsWUFBWSxDQUFDLE1BQU0sSUFDeEIsV0FBVyxpQ0FBTSxZQUFZLENBQUMsT0FBTyxHQUFLLElB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