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
        return Object.assign(Object.assign({}, convertArgs(Object.assign(Object.assign({}, args), jsonContent.options))), { groups: jsonContent.groups });
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
        const getAllPackages = createGetAllPackages(definitelyTypedPath);
        const { packageBenchmarks, typeScriptComparisons } = yield common_1.getDatabase(upload && !outFile ? "write" /* Write */ : "read" /* Read */);
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
        yield getTypeScript_1.getTypeScript(compareAgainstMajorMinor);
        const packagesToTest = packages ? packages.map(p => `${p.name}/v${p.majorVersion}`) : Array.from(priorResults.keys());
        const now = new Date();
        const comparisons = [];
        for (const packageKey of packagesToTest) {
            const { name, majorVersion } = common_1.parsePackageKey(packageKey);
            let priorResult = priorResults.get(packageKey);
            let priorResultId = priorResult && 'id' in priorResult && priorResult.id;
            if (priorResult) {
                if (!common_1.systemsAreCloseEnough(currentSystem, priorResult.system)) {
                    console.log(`Skipping ${packageKey} because the system is too different`);
                    continue;
                }
            }
            else {
                const benchmark = yield benchmark_1.benchmarkPackage(name, majorVersion.toString(), now, {
                    definitelyTypedPath,
                    iterations: common_1.config.benchmarks.languageServiceIterations,
                    tsVersion: compareAgainstMajorMinor,
                    nProcesses: os.cpus().length,
                    printSummary: true,
                    progress: false,
                    upload,
                    installTypeScript: false,
                    failOnErrors: false,
                    maxRunSeconds,
                });
                if (!benchmark) {
                    console.log(`Skipping ${packageKey} because it was deleted`);
                    continue;
                }
                priorResult = Object.assign({ id: benchmark.id }, common_1.createDocument(benchmark.summary, common_1.config.database.packageBenchmarksDocumentSchemaVersion));
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
                failOnErrors: false,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZVR5cGVTY3JpcHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2xpL2NvbXBhcmVUeXBlU2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6Qix1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLCtCQUFpQztBQUVqQyxzQ0FBK1o7QUFHL1osMkNBQStDO0FBQy9DLDREQUF5RDtBQUN6RCw2RkFBMkY7QUFDM0Ysb0NBQTBDO0FBQzFDLE1BQU0sU0FBUyxHQUFHLGdCQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzFDLE1BQU0sYUFBYSxHQUFHLHNCQUFhLEVBQUUsQ0FBQztBQWV0QyxTQUFTLFdBQVcsQ0FBQyxFQUF1QjtRQUF2QixFQUFFLElBQUksT0FBaUIsRUFBZiwyQkFBTztJQUNsQyxJQUFJLElBQUksRUFBRTtRQUNSLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RSx1Q0FDSyxXQUFXLGlDQUFNLElBQUksR0FBSyxXQUFXLENBQUMsT0FBTyxFQUFHLEtBQ25ELE1BQU0sRUFBRSxXQUFXLENBQUMsTUFBTSxJQUMxQjtLQUNIO0lBRUQsT0FBTztRQUNMLHdCQUF3QixFQUFFLHNCQUFhLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLDBCQUEwQixDQUFDLENBQUMsUUFBUSxFQUFFO1FBQzdHLG1CQUFtQixFQUFFLHFCQUFZLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDO1FBQ2xGLGNBQWMsRUFBRyxxQkFBWSxDQUFDLG9CQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLENBQUM7UUFDOUcsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLHFCQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsd0JBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQ2pLLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxxQkFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDakcsTUFBTSxFQUFFLHNCQUFhLENBQUMsb0JBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLFFBQVEsQ0FBQztRQUMvRCxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMscUJBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQ3pFLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxxQkFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDckYsVUFBVSxFQUFFLE9BQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLHFCQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztLQUM3RyxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQWdCLG9CQUFvQixDQUFDLElBQVU7SUFDN0MsT0FBTyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBRkQsb0RBRUM7QUFFRCxTQUFzQixpQkFBaUIsQ0FBQyxFQVViO1FBVmEsRUFDdEMsd0JBQXdCLEVBQ3hCLG1CQUFtQixFQUNuQixRQUFRLEVBQ1IsYUFBYSxFQUNiLGNBQWMsRUFDZCxNQUFNLEVBQ04sT0FBTyxFQUNQLE1BQU0sT0FFbUIsRUFEekIsb0pBQU87O1FBRVAsTUFBTSxjQUFjLEdBQUcsb0JBQW9CLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNqRSxNQUFNLEVBQUUsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUUsR0FBRyxNQUFNLG9CQUFXLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMscUJBQTJCLENBQUMsa0JBQXlCLENBQUMsQ0FBQztRQUNsSixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksc0JBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzFFLE1BQU0sWUFBWSxHQUFHLE1BQU07WUFDekIsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUF5RCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLDJCQUFrQixDQUFDLE1BQU0sQ0FBQyxVQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFVLENBQUMsQ0FBQztZQUM1SyxDQUFDLENBQUMsTUFBTSxnQ0FBZ0MsQ0FBQyxpQkFBaUIsRUFBRSx3QkFBd0IsRUFBRSxtQkFBbUIsRUFBRSxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFdkksSUFBSSxPQUFPLEVBQUU7WUFDWCxNQUFNLFVBQVUsR0FBRyxzQkFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDaEUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDakMsT0FBTyxFQUFFO29CQUNQLHdCQUF3QjtvQkFDeEIsbUJBQW1CO29CQUNuQixhQUFhO29CQUNiLGNBQWM7b0JBQ2QsTUFBTTtpQkFDUDtnQkFDRCxNQUFNLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUNwRSxNQUFNLFVBQVUsR0FBRyxLQUFLLEdBQUcsVUFBVSxDQUFDO29CQUN0QyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDdEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUM7cUJBQ2xEO3lCQUFNO3dCQUNMLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUUsRUFBRSxDQUFDO3FCQUN4RDtvQkFDRCxPQUFPLE1BQU0sQ0FBQztnQkFDaEIsQ0FBQyxFQUFFLEVBQTRELENBQUM7YUFDakUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFakIsT0FBTyxTQUFTLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNoRDtRQUVELE1BQU0sNkJBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN0SCxNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sV0FBVyxHQUE2RSxFQUFFLENBQUM7UUFDakcsS0FBSyxNQUFNLFVBQVUsSUFBSSxjQUFjLEVBQUU7WUFDdkMsTUFBTSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsR0FBRyx3QkFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzNELElBQUksV0FBVyxHQUFtRyxZQUFZLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQy9JLElBQUksYUFBYSxHQUFHLFdBQVcsSUFBSSxJQUFJLElBQUksV0FBVyxJQUFJLFdBQVcsQ0FBQyxFQUFFLENBQUM7WUFDekUsSUFBSSxXQUFXLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLDhCQUFxQixDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQzdELE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxVQUFVLHNDQUFzQyxDQUFDLENBQUM7b0JBQzFFLFNBQVM7aUJBQ1Y7YUFDRjtpQkFBTTtnQkFDTCxNQUFNLFNBQVMsR0FBRyxNQUFNLDRCQUFnQixDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFO29CQUMzRSxtQkFBbUI7b0JBQ25CLFVBQVUsRUFBRSxlQUFNLENBQUMsVUFBVSxDQUFDLHlCQUF5QjtvQkFDdkQsU0FBUyxFQUFFLHdCQUF3QjtvQkFDbkMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNO29CQUM1QixZQUFZLEVBQUUsSUFBSTtvQkFDbEIsUUFBUSxFQUFFLEtBQUs7b0JBQ2YsTUFBTTtvQkFDTixpQkFBaUIsRUFBRSxLQUFLO29CQUN4QixZQUFZLEVBQUUsS0FBSztvQkFDbkIsYUFBYTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksVUFBVSx5QkFBeUIsQ0FBQyxDQUFDO29CQUM3RCxTQUFTO2lCQUNWO2dCQUVELFdBQVcsbUJBQ1QsRUFBRSxFQUFFLFNBQVMsQ0FBQyxFQUFFLElBQ2IsdUJBQWMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLGVBQU0sQ0FBQyxRQUFRLENBQUMsc0NBQXNDLENBQUMsQ0FDN0YsQ0FBQzthQUNIO1lBRUQsTUFBTSxhQUFhLEdBQUcsdUJBQWMsQ0FBQyxDQUFDLE1BQU0sNEJBQWdCLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLEVBQUU7Z0JBQy9GLG1CQUFtQjtnQkFDbkIsVUFBVSxFQUFFLGVBQU0sQ0FBQyxVQUFVLENBQUMseUJBQXlCO2dCQUN2RCxTQUFTLEVBQUUsT0FBTztnQkFDbEIsbUJBQW1CLEVBQUUsY0FBYztnQkFDbkMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNO2dCQUM1QixZQUFZLEVBQUUsSUFBSTtnQkFDbEIsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsaUJBQWlCLEVBQUUsS0FBSztnQkFDeEIsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLGFBQWE7YUFDZCxDQUFDLENBQUUsQ0FBQyxPQUFPLEVBQUUsZUFBTSxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBRXRFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFZLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNoRCxJQUFJLE1BQU0sSUFBSSxhQUFhLEVBQUU7Z0JBQzNCLE1BQU0sVUFBVSxHQUE0QjtvQkFDMUMsYUFBYSxFQUFFLHlCQUFnQixDQUFDLGNBQWMsQ0FBQztvQkFDL0MsZ0NBQWdDLEVBQUUsYUFBYTtvQkFDL0MsYUFBYSxFQUFFLGFBQWEsQ0FBQyxJQUFJO2lCQUNsQyxDQUFDO2dCQUNGLE1BQU0sc0JBQWMsQ0FDbEIsVUFBVSxFQUNWLGVBQU0sQ0FBQyxRQUFRLENBQUMsMENBQTBDLEVBQzFELHFCQUFxQixDQUFDLENBQUM7YUFDMUI7U0FDRjtRQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sZ0VBQStCLENBQUMsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDckYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7Q0FDdEI7QUE5R0QsOENBOEdDO0FBRUQsU0FBZSxnQ0FBZ0MsQ0FBQyxTQUFvQixFQUFFLGlCQUF5QixFQUFFLG1CQUEyQixFQUFFLGNBQXVELEVBQUUsV0FBeUI7OztRQUM5TSxNQUFNLFFBQVEsR0FBNEUsTUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUNwSCxLQUFLLEVBQUUsaUJBQWlCLGVBQU0sQ0FBQyxRQUFRLENBQUMsNEJBQTRCLElBQUk7Z0JBQ3hFLGlFQUFpRTtnQkFDakUsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDWixnQ0FBZ0MsV0FBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxxREFBcUQ7b0JBQy9JLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDUCxVQUFVLEVBQUU7Z0JBQ1YsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixFQUFFO2FBQ3pEO1NBQ0YsRUFBRTtZQUNELHlCQUF5QixFQUFFLElBQUk7U0FDaEMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFdEIsTUFBTSxXQUFXLEdBQUcsV0FBVyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMscUJBQVksQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUEwRCxDQUFDOztZQUNuRixLQUErQixJQUFBLGFBQUEsY0FBQSxRQUFRLENBQUEsY0FBQTtnQkFBNUIsTUFBTSxFQUFFLE1BQU0sRUFBRSxxQkFBQSxDQUFBO2dCQUN6QixJQUFJLENBQUMsTUFBTTtvQkFBRSxTQUFTO2dCQUN0QixNQUFNLFVBQVUsR0FBRyxxQkFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ3JGLElBQUksV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDcEQsU0FBUztpQkFDVjtnQkFFRCxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUU7b0JBQ3ZELFNBQVM7aUJBQ1Y7Z0JBRUQsTUFBTSxTQUFTLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFZLEVBQUUsQ0FBQztnQkFDNUgsTUFBTSxlQUFlLEdBQUcsTUFBTSwyQkFBa0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUM7Z0JBQzdHLElBQUksZUFBZSxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsMkJBQWtCLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRTtvQkFDMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLFVBQVUscUJBQXFCLENBQUMsQ0FBQztvQkFDekQsU0FBUztpQkFDVjtxQkFBTSxJQUFJLGVBQWUsRUFBRTtvQkFDMUIsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLE1BQU0sY0FBYyxFQUFFLENBQUM7b0JBQy9DLE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsWUFBWSxDQUFDO29CQUN4RSxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLDJCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDM0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLFVBQVUsa0RBQWtELENBQUMsQ0FBQzt3QkFDdEYsU0FBUztxQkFDVjtpQkFDRjtnQkFFRCxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNsQzs7Ozs7Ozs7O1FBRUQsT0FBTyxRQUFRLENBQUM7O0NBQ2pCO0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxtQkFBMkI7SUFDdkQsSUFBSSxNQUF1RSxDQUFDO0lBQzVFLE9BQU8sR0FBUyxFQUFFO1FBQ2hCLE9BQU8sTUFBTSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sMEJBQWlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0lBQzNFLENBQUMsQ0FBQSxDQUFDO0FBQ0osQ0FBQyJ9