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
const measure_1 = require("../measure");
const postTypeScriptComparisonResult_1 = require("../github/postTypeScriptComparisonResult");
const writeFile = util_1.promisify(fs.writeFile);
const currentSystem = common_1.getSystemInfo();
function convertArgs(_a) {
    var { file } = _a, args = __rest(_a, ["file"]);
    if (file) {
        const jsonContent = require(path.resolve(common_1.assertString(file, 'file')));
        return Object.assign({}, convertArgs(args), { groups: jsonContent.groups });
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
        agentIndex: args.agentIndex ? common_1.assertNumber(args.agentIndex, 'agentIndex') : undefined,
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
        const { container } = yield common_1.getDatabase("read" /* Read */);
        const priorResults = yield getPackagesToTestAndPriorResults(container, compareAgainstMajorMinor, definitelyTypedPath, getAllPackages, packages);
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
            });
            return writeFile(outFile, fileContent, 'utf8');
        }
        const packagesToTest = packages ? packages.map(p => `${p.name}/v${p.majorVersion}`) : Array.from(priorResults.keys());
        const now = new Date();
        const comparisons = [];
        for (const packageKey of packagesToTest) {
            const { name, majorVersion } = common_1.parsePackageKey(packageKey);
            let priorResult = priorResults.get(packageKey);
            if (!priorResult) {
                priorResult = common_1.createDocument(measure_1.summarize((yield benchmark_1.benchmarkPackage(name, majorVersion.toString(), now, {
                    definitelyTypedPath,
                    iterations: common_1.config.benchmarks.languageServiceIterations,
                    tsVersion: compareAgainstMajorMinor,
                    nProcesses: os.cpus().length,
                    printSummary: true,
                    progress: false,
                    upload,
                    installTypeScript: false,
                    maxRunSeconds,
                }))[0]), common_1.config.database.packageBenchmarksDocumentSchemaVersion);
            }
            const currentResult = common_1.createDocument(measure_1.summarize((yield benchmark_1.benchmarkPackage(name, majorVersion.toString(), now, {
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
            }))[0]), common_1.config.database.packageBenchmarksDocumentSchemaVersion);
            comparisons.push([priorResult, currentResult]);
        }
        const comment = yield postTypeScriptComparisonResult_1.postTypeScriptComparisonResults({ comparisons, dryRun: true });
        console.log(comment);
    });
}
exports.compareTypeScript = compareTypeScript;
function getPackagesToTestAndPriorResults(container, typeScriptVersion, definitelyTypedPath, getAllPackages, packageList) {
    return __awaiter(this, void 0, void 0, function* () {
        var e_1, _a;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZVR5cGVTY3JpcHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2xpL2NvbXBhcmVUeXBlU2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6Qix1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLCtCQUFpQztBQUVqQyxzQ0FBbVY7QUFHblYsMkNBQStDO0FBQy9DLDREQUF5RDtBQUN6RCx3Q0FBdUM7QUFDdkMsNkZBQTJGO0FBQzNGLE1BQU0sU0FBUyxHQUFHLGdCQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzFDLE1BQU0sYUFBYSxHQUFHLHNCQUFhLEVBQUUsQ0FBQztBQWV0QyxTQUFTLFdBQVcsQ0FBQyxFQUF1QjtRQUF2QixFQUFFLElBQUksT0FBaUIsRUFBZiwyQkFBTztJQUNsQyxJQUFJLElBQUksRUFBRTtRQUNSLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RSx5QkFDSyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQ3BCLE1BQU0sRUFBRSxXQUFXLENBQUMsTUFBTSxJQUMxQjtLQUNIO0lBRUQsT0FBTztRQUNMLHdCQUF3QixFQUFFLHNCQUFhLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLDBCQUEwQixDQUFDLENBQUMsUUFBUSxFQUFFO1FBQzdHLG1CQUFtQixFQUFFLHFCQUFZLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDO1FBQ2xGLGNBQWMsRUFBRyxxQkFBWSxDQUFDLG9CQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLENBQUM7UUFDOUcsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLHFCQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsd0JBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQ2pLLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxxQkFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDakcsTUFBTSxFQUFFLHNCQUFhLENBQUMsb0JBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLFFBQVEsQ0FBQztRQUMvRCxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMscUJBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1FBQ3pFLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxxQkFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDckYsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLHFCQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztLQUN0RixDQUFDO0FBQ0osQ0FBQztBQUVELFNBQWdCLG9CQUFvQixDQUFDLElBQVU7SUFDN0MsT0FBTyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBRkQsb0RBRUM7QUFFRCxTQUFzQixpQkFBaUIsQ0FBQyxFQVViO1FBVmEsRUFDdEMsd0JBQXdCLEVBQ3hCLG1CQUFtQixFQUNuQixRQUFRLEVBQ1IsYUFBYSxFQUNiLGNBQWMsRUFDZCxNQUFNLEVBQ04sT0FBTyxFQUNQLE1BQU0sT0FFbUIsRUFEekIsb0pBQU87O1FBRVAsTUFBTSw2QkFBYSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDOUMsTUFBTSxjQUFjLEdBQUcsb0JBQW9CLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNqRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsTUFBTSxvQkFBVyxtQkFBMEIsQ0FBQztRQUNsRSxNQUFNLFlBQVksR0FBRyxNQUFNLGdDQUFnQyxDQUFDLFNBQVMsRUFBRSx3QkFBd0IsRUFBRSxtQkFBbUIsRUFBRSxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDL0ksSUFBSSxPQUFPLEVBQUU7WUFDWCxNQUFNLFVBQVUsR0FBRyxzQkFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDaEUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDakMsT0FBTyxFQUFFO29CQUNQLHdCQUF3QjtvQkFDeEIsbUJBQW1CO29CQUNuQixhQUFhO29CQUNiLGNBQWM7b0JBQ2QsTUFBTTtpQkFDUDtnQkFDRCxNQUFNLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUNwRSxNQUFNLFVBQVUsR0FBRyxLQUFLLEdBQUcsVUFBVSxDQUFDO29CQUN0QyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTt3QkFDdEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFFLENBQUM7cUJBQ2xEO3lCQUFNO3dCQUNMLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUUsRUFBRSxDQUFDO3FCQUN4RDtvQkFDRCxPQUFPLE1BQU0sQ0FBQztnQkFDaEIsQ0FBQyxFQUFFLEVBQTRELENBQUM7YUFDakUsQ0FBQyxDQUFDO1lBRUgsT0FBTyxTQUFTLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNoRDtRQUVELE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN0SCxNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3ZCLE1BQU0sV0FBVyxHQUE2RSxFQUFFLENBQUM7UUFDakcsS0FBSyxNQUFNLFVBQVUsSUFBSSxjQUFjLEVBQUU7WUFDdkMsTUFBTSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsR0FBRyx3QkFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzNELElBQUksV0FBVyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDaEIsV0FBVyxHQUFHLHVCQUFjLENBQUMsbUJBQVMsQ0FBQyxDQUFDLE1BQU0sNEJBQWdCLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLEVBQUU7b0JBQ2pHLG1CQUFtQjtvQkFDbkIsVUFBVSxFQUFFLGVBQU0sQ0FBQyxVQUFVLENBQUMseUJBQXlCO29CQUN2RCxTQUFTLEVBQUUsd0JBQXdCO29CQUNuQyxVQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU07b0JBQzVCLFlBQVksRUFBRSxJQUFJO29CQUNsQixRQUFRLEVBQUUsS0FBSztvQkFDZixNQUFNO29CQUNOLGlCQUFpQixFQUFFLEtBQUs7b0JBQ3hCLGFBQWE7aUJBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxlQUFNLENBQUMsUUFBUSxDQUFDLHNDQUFzQyxDQUFDLENBQUM7YUFDbEU7WUFFRCxNQUFNLGFBQWEsR0FBRyx1QkFBYyxDQUFDLG1CQUFTLENBQUMsQ0FBQyxNQUFNLDRCQUFnQixDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFO2dCQUN6RyxtQkFBbUI7Z0JBQ25CLFVBQVUsRUFBRSxlQUFNLENBQUMsVUFBVSxDQUFDLHlCQUF5QjtnQkFDdkQsU0FBUyxFQUFFLE9BQU87Z0JBQ2xCLG1CQUFtQixFQUFFLGNBQWM7Z0JBQ25DLFVBQVUsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTTtnQkFDNUIsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFFBQVEsRUFBRSxLQUFLO2dCQUNmLE1BQU0sRUFBRSxLQUFLO2dCQUNiLGlCQUFpQixFQUFFLEtBQUs7Z0JBQ3hCLGFBQWE7YUFDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLGVBQU0sQ0FBQyxRQUFRLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUVqRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7U0FDaEQ7UUFFRCxNQUFNLE9BQU8sR0FBRyxNQUFNLGdFQUErQixDQUFDLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7O0NBQ3RCO0FBN0VELDhDQTZFQztBQUVELFNBQWUsZ0NBQWdDLENBQUMsU0FBb0IsRUFBRSxpQkFBeUIsRUFBRSxtQkFBMkIsRUFBRSxjQUF1RCxFQUFFLFdBQXlCOzs7UUFDOU0sTUFBTSxRQUFRLEdBQStELE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDdkcsS0FBSyxFQUFFLGlCQUFpQixlQUFNLENBQUMsUUFBUSxDQUFDLDRCQUE0QixJQUFJO2dCQUN4RSxpRUFBaUU7Z0JBQ2pFLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ1osZ0NBQWdDLFdBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMscURBQXFEO29CQUMvSSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ1AsVUFBVSxFQUFFO2dCQUNWLEVBQUUsSUFBSSxFQUFFLG9CQUFvQixFQUFFLEtBQUssRUFBRSxpQkFBaUIsRUFBRTthQUN6RDtTQUNGLEVBQUU7WUFDRCx5QkFBeUIsRUFBRSxJQUFJO1NBQ2hDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBRXRCLE1BQU0sV0FBVyxHQUFHLFdBQVcsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLHFCQUFZLENBQUMsQ0FBQztRQUNqRSxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBNkMsQ0FBQzs7WUFDdEUsS0FBK0IsSUFBQSxhQUFBLGNBQUEsUUFBUSxDQUFBLGNBQUE7Z0JBQTVCLE1BQU0sRUFBRSxNQUFNLEVBQUUscUJBQUEsQ0FBQTtnQkFDekIsSUFBSSxDQUFDLE1BQU07b0JBQUUsU0FBUztnQkFDdEIsTUFBTSxVQUFVLEdBQUcscUJBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUNyRixJQUFJLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3BELFNBQVM7aUJBQ1Y7Z0JBRUQsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDM0MsSUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFO29CQUN2RCxTQUFTO2lCQUNWO2dCQUVELElBQUksQ0FBQyw4QkFBcUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxFQUFFO29CQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksVUFBVSxzQ0FBc0MsQ0FBQyxDQUFDO29CQUMxRSxTQUFTO2lCQUNWO2dCQUVELE1BQU0sU0FBUyxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLElBQUksR0FBWSxFQUFFLENBQUM7Z0JBQzVILE1BQU0sZUFBZSxHQUFHLE1BQU0sMkJBQWtCLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO2dCQUM3RyxJQUFJLGVBQWUsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLDJCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUU7b0JBQzFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxVQUFVLHFCQUFxQixDQUFDLENBQUM7b0JBQ3pELFNBQVM7aUJBQ1Y7cUJBQU0sSUFBSSxlQUFlLEVBQUU7b0JBQzFCLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxNQUFNLGNBQWMsRUFBRSxDQUFDO29CQUMvQyxNQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFlBQVksQ0FBQztvQkFDeEUsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQywyQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7d0JBQzNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxVQUFVLGtEQUFrRCxDQUFDLENBQUM7d0JBQ3RGLFNBQVM7cUJBQ1Y7aUJBQ0Y7Z0JBRUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDbEM7Ozs7Ozs7OztRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7Q0FBQTtBQUVELFNBQVMsb0JBQW9CLENBQUMsbUJBQTJCO0lBQ3ZELElBQUksTUFBdUUsQ0FBQztJQUM1RSxPQUFPLEdBQVMsRUFBRTtRQUNoQixPQUFPLE1BQU0sSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLDBCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztJQUMzRSxDQUFDLENBQUEsQ0FBQztBQUNKLENBQUMifQ==