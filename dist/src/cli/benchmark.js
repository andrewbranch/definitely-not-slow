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
        const { ts, tsPath } = yield getTypeScript_1.getTypeScript(tsVersion.toString(), localTypeScriptPath, installTypeScript);
        const { allPackages } = yield common_1.getParsedPackages(definitelyTypedPath);
        const benchmark = yield measure_1.measurePerf({
            packageName,
            packageVersion: packageVersion.replace(/^v/, ''),
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
        const summary = measure_1.summarize(benchmark);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVuY2htYXJrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaS9iZW5jaG1hcmsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0Isc0NBQStKO0FBQy9KLDREQUF5RDtBQUN6RCxvQ0FBMEM7QUFDMUMsd0NBQWtFO0FBR2xFLE1BQU0sYUFBYSxHQUFHLHNCQUFhLEVBQUUsQ0FBQztBQW9CdEMsU0FBUyxXQUFXLENBQUMsRUFBdUI7UUFBdkIsRUFBRSxJQUFJLE9BQWlCLEVBQWYsMkJBQU87SUFDbEMsSUFBSSxJQUFJLEVBQUU7UUFDUixNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBWSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkUsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxhQUFhLENBQUMsSUFBSSxFQUFFO1lBQ25ELE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQztZQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pFLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3BFO1FBQ0QsdUJBQ0UsTUFBTSxFQUFFLFlBQVksQ0FBQyxNQUFNLElBQ3hCLFdBQVcsbUJBQU0sWUFBWSxDQUFDLE9BQU8sRUFBSyxJQUFJLEVBQUcsSUFDcEQs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