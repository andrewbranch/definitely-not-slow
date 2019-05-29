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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const common_1 = require("../common");
const benchmark_1 = require("./benchmark");
const getTypeScript_1 = require("../measure/getTypeScript");
const postTypeScriptComparisonResult_1 = require("../github/postTypeScriptComparisonResult");
const write_1 = require("../write");
const writeFile = util_1.promisify(fs.writeFile);
const currentSystem = common_1.getSystemInfo();
function convertArgs(_a) {
    var { file } = _a, args = __rest(_a, ["file"]);
    if (file) {
        const jsonContent = require(path.resolve(common_1.assertString(file, 'file')));
        return Object.assign({}, convertArgs(Object.assign({}, args, jsonContent.options)), { groups: jsonContent.groups });
    }
    return {
        compareAgainstMajorMinor: common_1.assertDefined(args.compareAgainstMajorMinor, 'compareAgainstMajorMinor').toString(),
        definitelyTypedPath: common_1.assertString(args.definitelyTypedPath, 'definitelyTypedPath'),
        typeScriptPath: common_1.assertString(common_1.withDefault(args.typeScriptPath, path.resolve('built/local')), 'typeScriptPath'),
        packages: args.packages === true ? undefined : args.packages ? common_1.assertString(args.packages, 'packages').split(',').map(p => common_1.parsePackageKey(p.trim())) : undefined,
        maxRunSeconds: args.maxRunSeconds ? common_1.assertNumber(args.maxRunSeconds, 'maxRunSeconds') : undefined,
        upload: common_1.assertBoolean(common_1.withDefault(args.upload, true), 'upload'),
        outFile: args.outFile ? common_1.assertString(args.outFile, 'outFile') : undefined,
        agentCount: args.agentCount ? common_1.assertNumber(args.agentCount, 'agentCount') : undefined,
        agentIndex: typeof args.agentIndex !== 'undefined' ? common_1.assertNumber(args.agentIndex, 'agentIndex') : undefined,
    };
}
function compareTypeScriptCLI(args) {
    return compareTypeScript(convertArgs(args));
}
exports.compareTypeScriptCLI = compareTypeScriptCLI;
function compareTypeScript(_a) {
    var { compareAgainstMajorMinor, definitelyTypedPath, packages, maxRunSeconds, typeScriptPath, upload, outFile, groups } = _a, opts = __rest(_a, ["compareAgainstMajorMinor", "definitelyTypedPath", "packages", "maxRunSeconds", "typeScriptPath", "upload", "outFile", "groups"]);
    return __awaiter(this, void 0, void 0, function* () {
        yield getTypeScript_1.getTypeScript(compareAgainstMajorMinor);
        const getAllPackages = createGetAllPackages(definitelyTypedPath);
        const { packageBenchmarks, typeScriptComparisons } = yield common_1.getDatabase(upload ? "write" /* Write */ : "read" /* Read */);
        const agentIndex = groups && common_1.assertDefined(opts.agentIndex, 'agentIndex');
        const priorResults = groups
            ? new Map(Object.keys(groups[agentIndex]).map(key => [key, common_1.deserializeSummary(groups[agentIndex][key])]))
            : yield getPackagesToTestAndPriorResults(packageBenchmarks, compareAgainstMajorMinor, definitelyTypedPath, getAllPackages, packages);
        if (outFile) {
            const agentCount = common_1.assertDefined(opts.agentCount, 'agentCount');
            const fileContent = JSON.stringify({
                options: {
                    compareAgainstMajorMinor,
                    definitelyTypedPath,
                    maxRunSeconds,
                    typeScriptPath,
                    upload,
                },
                groups: Array.from(priorResults.keys()).reduce((groups, key, index) => {
                    const agentIndex = index % agentCount;
                    if (groups[agentIndex]) {
                        groups[agentIndex][key] = priorResults.get(key);
                    }
                    else {
                        groups[agentIndex] = { [key]: priorResults.get(key) };
                    }
                    return groups;
                }, []),
            }, undefined, 2);
            return writeFile(outFile, fileContent, 'utf8');
        }
        const packagesToTest = packages ? packages.map(p => `${p.name}/v${p.majorVersion}`) : Array.from(priorResults.keys());
        const now = new Date();
        const comparisons = [];
        for (const packageKey of packagesToTest) {
            const { name, majorVersion } = common_1.parsePackageKey(packageKey);
            let priorResult = priorResults.get(packageKey);
            let priorResultId = priorResult && 'id' in priorResult && priorResult.id;
            if (!priorResult) {
                const { id, summary } = yield benchmark_1.benchmarkPackage(name, majorVersion.toString(), now, {
                    definitelyTypedPath,
                    iterations: common_1.config.benchmarks.languageServiceIterations,
                    tsVersion: compareAgainstMajorMinor,
                    nProcesses: os.cpus().length,
                    printSummary: true,
                    progress: false,
                    upload,
                    installTypeScript: false,
                    maxRunSeconds,
                });
                priorResult = Object.assign({ id }, common_1.createDocument(summary, common_1.config.database.packageBenchmarksDocumentSchemaVersion));
            }
            const currentResult = common_1.createDocument((yield benchmark_1.benchmarkPackage(name, majorVersion.toString(), now, {
                definitelyTypedPath,
                iterations: common_1.config.benchmarks.languageServiceIterations,
                tsVersion: 'local',
                localTypeScriptPath: typeScriptPath,
                nProcesses: os.cpus().length,
                printSummary: true,
                progress: false,
                upload: false,
                installTypeScript: false,
                maxRunSeconds,
            })).summary, common_1.config.database.packageBenchmarksDocumentSchemaVersion);
            comparisons.push([priorResult, currentResult]);
            if (upload && priorResultId) {
                const comparison = {
                    sourceVersion: common_1.getSourceVersion(typeScriptPath),
                    compareAgainstPackageBenchmarkId: priorResultId,
                    headBenchmark: currentResult.body,
                };
                yield write_1.insertDocument(comparison, common_1.config.database.typeScriptComparisonsDocumentSchemaVersion, typeScriptComparisons);
            }
        }
        const comment = yield postTypeScriptComparisonResult_1.postTypeScriptComparisonResults({ comparisons, dryRun: true });
        console.log(comment);
    });
}
exports.compareTypeScript = compareTypeScript;
function getPackagesToTestAndPriorResults(container, typeScriptVersion, definitelyTypedPath, getAllPackages, packageList) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const iterator = yield container.items.query({
            query: `SELECT * FROM ${common_1.config.database.packageBenchmarksContainerId} b` +
                `  WHERE b.body.typeScriptVersionMajorMinor = @typeScriptVersion` +
                (packageList ?
                    `  AND b.body.packageName IN (${packageList.map(({ name }) => `"${name}"`).join(', ')})` // Couldn’t figure out how to do this with parameters
                    : ''),
            parameters: [
                { name: '@typeScriptVersion', value: typeScriptVersion },
            ],
        }, {
            enableCrossPartitionQuery: true,
        }).getAsyncIterator();
        const packageKeys = packageList && packageList.map(common_1.toPackageKey);
        const packages = new Map();
        try {
            for (var iterator_1 = __asyncValues(iterator), iterator_1_1; iterator_1_1 = yield iterator_1.next(), !iterator_1_1.done;) {
                const { result } = iterator_1_1.value;
                if (!result)
                    continue;
                const packageKey = common_1.toPackageKey(result.body.packageName, result.body.packageVersion);
                if (packageKeys && !packageKeys.includes(packageKey)) {
                    continue;
                }
                const candidate = packages.get(packageKey);
                if (candidate && candidate.createdAt > result.createdAt) {
                    continue;
                }
                if (!common_1.systemsAreCloseEnough(result.system, currentSystem)) {
                    console.log(`Skipping ${packageKey} because the system is too different`);
                    continue;
                }
                const packageId = { name: result.body.packageName, majorVersion: parseInt(result.body.packageVersion, 10) || '*' };
                const changedPackages = yield common_1.getChangedPackages({ diffTo: result.body.sourceVersion, definitelyTypedPath });
                if (changedPackages && changedPackages.some(common_1.packageIdsAreEqual(packageId))) {
                    console.log(`Skipping ${packageKey} because it changed`);
                    continue;
                }
                else if (changedPackages) {
                    const { allPackages } = yield getAllPackages();
                    const dependencies = allPackages.getTypingsData(packageId).dependencies;
                    if (dependencies.some(dep => changedPackages.some(common_1.packageIdsAreEqual(dep)))) {
                        console.log(`Skipping ${packageKey} because one or more of its dependencies changed`);
                        continue;
                    }
                }
                packages.set(packageKey, result);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (iterator_1_1 && !iterator_1_1.done && (_a = iterator_1.return)) yield _a.call(iterator_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return packages;
    });
}
function createGetAllPackages(definitelyTypedPath) {
    let result;
    return () => __awaiter(this, void 0, void 0, function* () {
        return result || (result = yield common_1.getParsedPackages(definitelyTypedPath));
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZVR5cGVTY3JpcHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2xpL2NvbXBhcmVUeXBlU2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsdUNBQXlCO0FBQ3pCLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0IsK0JBQWlDO0FBRWpDLHNDQUErWjtBQUcvWiwyQ0FBK0M7QUFDL0MsNERBQXlEO0FBRXpELDZGQUEyRjtBQUMzRixvQ0FBMEM7QUFDMUMsTUFBTSxTQUFTLEdBQUcsZ0JBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDMUMsTUFBTSxhQUFhLEdBQUcsc0JBQWEsRUFBRSxDQUFDO0FBZXRDLFNBQVMsV0FBVyxDQUFDLEVBQXVCO1FBQXZCLEVBQUUsSUFBSSxPQUFpQixFQUFmLDJCQUFPO0lBQ2xDLElBQUksSUFBSSxFQUFFO1FBQ1IsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLHlCQUNLLFdBQVcsbUJBQU0sSUFBSSxFQUFLLFdBQVcsQ0FBQyxPQUFPLEVBQUcsSUFDbkQsTUFBTSxFQUFFLFdBQVcsQ0FBQyxNQUFNLElBQzFCO0tBQ0g7SUFFRCxPQUFPO1FBQ0wsd0JBQXdCLEVBQUUsc0JBQWEsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsMEJBQTBCLENBQUMsQ0FBQyxRQUFRLEVBQUU7UUFDN0csbUJBQW1CLEVBQUUscUJBQVksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUscUJBQXFCLENBQUM7UUFDbEYsY0FBYyxFQUFHLHFCQUFZLENBQUMsb0JBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxn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