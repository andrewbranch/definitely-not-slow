"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
const path = __importStar(require("path"));
const common_1 = require("../common");
const benchmark_1 = require("./benchmark");
const getTypeScript_1 = require("../measure/getTypeScript");
const measure_1 = require("../measure");
const postTypeScriptComparisonResult_1 = require("../github/postTypeScriptComparisonResult");
function convertArgs(args) {
    return {
        compareAgainstMajorMinor: common_1.assertDefined(args.compareAgainstMajorMinor, 'compareAgainstMajorMinor').toString(),
        definitelyTypedPath: common_1.assertString(args.definitelyTypedPath, 'definitelyTypedPath'),
        typeScriptPath: common_1.assertString(common_1.withDefault(args.typeScriptPath, path.resolve('built/local')), 'typeScriptPath'),
        packages: args.packages === true ? undefined : args.packages ? common_1.assertString(args.packages, 'packages').split(',').map(p => common_1.parsePackageKey(p.trim())) : undefined,
        maxRunSeconds: args.maxRunSeconds ? common_1.assertNumber(args.maxRunSeconds, 'maxRunSeconds') : undefined,
        upload: common_1.assertBoolean(common_1.withDefault(args.upload, true), 'upload'),
    };
}
function compareTypeScriptCLI(args) {
    return compareTypeScript(convertArgs(args));
}
exports.compareTypeScriptCLI = compareTypeScriptCLI;
function compareTypeScript({ compareAgainstMajorMinor, definitelyTypedPath, packages, maxRunSeconds, typeScriptPath, upload, }) {
    return __awaiter(this, void 0, void 0, function* () {
        yield getTypeScript_1.getTypeScript(compareAgainstMajorMinor);
        const getAllPackages = createGetAllPackages(definitelyTypedPath);
        const { container } = yield common_1.getDatabase("read" /* Read */);
        const priorResults = yield getPackagesToTestAndPriorResults(container, compareAgainstMajorMinor, definitelyTypedPath, getAllPackages, packages);
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
                const packageId = { name: result.body.packageName, majorVersion: parseInt(result.body.packageVersion, 10) || '*' };
                const changedPackages = yield common_1.getChangedPackages({ diffTo: result.body.sourceVersion, definitelyTypedPath });
                if (changedPackages && changedPackages.some(common_1.packageIdsAreEqual(packageId))) {
                    console.log(`Skipping ${packageKey} because it changed`);
                    continue;
                }
                else if (!changedPackages) {
                    packages.set(packageKey, result);
                    continue;
                }
                const { allPackages } = yield getAllPackages();
                const dependencies = allPackages.getTypingsData(packageId).dependencies;
                if (dependencies.some(dep => changedPackages.some(common_1.packageIdsAreEqual(dep)))) {
                    console.log(`Skipping ${packageKey} because one or more of its dependencies changed`);
                    continue;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZVR5cGVTY3JpcHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2xpL2NvbXBhcmVUeXBlU2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFFN0Isc0NBQStSO0FBRy9SLDJDQUErQztBQUMvQyw0REFBeUQ7QUFDekQsd0NBQXVDO0FBQ3ZDLDZGQUEyRjtBQVczRixTQUFTLFdBQVcsQ0FBQyxJQUFVO0lBQzdCLE9BQU87UUFDTCx3QkFBd0IsRUFBRSxzQkFBYSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDLFFBQVEsRUFBRTtRQUM3RyxtQkFBbUIsRUFBRSxxQkFBWSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxxQkFBcUIsQ0FBQztRQUNsRixjQUFjLEVBQUcscUJBQVksQ0FBQyxvQkFBVyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLGdCQUFnQixDQUFDO1FBQzlHLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxxQkFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLHdCQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztRQUNqSyxhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMscUJBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUMs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