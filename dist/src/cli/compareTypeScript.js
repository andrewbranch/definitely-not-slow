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
const currentSystem = common_1.getSystemInfo();
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
                if (!common_1.systemsAreCloseEnough(result.system, currentSystem)) {
                    console.log(`Skipping ${packageKey} because the system is too different`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZVR5cGVTY3JpcHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2xpL2NvbXBhcmVUeXBlU2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFFN0Isc0NBQXFVO0FBR3JVLDJDQUErQztBQUMvQyw0REFBeUQ7QUFDekQsd0NBQXVDO0FBQ3ZDLDZGQUEyRjtBQUMzRixNQUFNLGFBQWEsR0FBRyxzQkFBYSxFQUFFLENBQUM7QUFXdEMsU0FBUyxXQUFXLENBQUMsSUFBVTtJQUM3QixPQUFPO1FBQ0wsd0JBQXdCLEVBQUUsc0JBQWEsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsMEJBQTBCLENBQUMsQ0FBQyxRQUFRLEVBQUU7UUFDN0csbUJBQW1CLEVBQUUscUJBQVksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUscUJBQXFCLENBQUM7UUFDbEYsY0FBYyxFQUFHLHFCQUFZLENBQUMsb0JBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQztRQUM5RyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMscUJBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyx3QkFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDakssYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLHFCQUFZLENBQUMsSUFB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