"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
const query_1 = require("../query");
const benchmark_1 = require("./benchmark");
const util_1 = require("types-publisher/bin/util/util");
const get_affected_packages_1 = require("types-publisher/bin/tester/get-affected-packages");
const measure_1 = require("../measure");
const getTypeScript_1 = require("../measure/getTypeScript");
const postInitialComparisonResults_1 = require("../github/postInitialComparisonResults");
const postDependentsComparisonResults_1 = require("../github/postDependentsComparisonResults");
function compare(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const definitelyTypedPath = path.resolve(common_1.assertString(common_1.withDefault(args.definitelyTypedPath, process.cwd()), 'definitelyTypedPath'));
        const typeScriptVersionMajorMinor = common_1.assertString(args.typeScriptVersion ? args.typeScriptVersion.toString() : undefined);
        const { allPackages } = yield common_1.getParsedPackages(definitelyTypedPath);
        const changedPackages = yield common_1.getChangedPackages({ diffTo: 'origin/master', definitelyTypedPath });
        const maxRunSeconds = args.maxRunSeconds ? common_1.assertNumber(args.maxRunSeconds) : undefined;
        const shouldComment = !!args.comment;
        const runDependents = args.runDependents ? typeof args.runDependents === 'number' ? args.runDependents : 2 : 0;
        if (!changedPackages) {
            console.log('No changed packages; nothing to do');
            return;
        }
        yield getTypeScript_1.getTypeScript(typeScriptVersionMajorMinor);
        const affectedPackages = get_affected_packages_1.getAffectedPackages(allPackages, changedPackages);
        const comparisons = [];
        for (const affectedPackage of affectedPackages.changedPackages) {
            console.log(`Comparing ${affectedPackage.id.name}/v${affectedPackage.major} because it changed...\n\n`);
            comparisons.push(yield compareBenchmarks({
                allPackages,
                definitelyTypedPath,
                typeScriptVersionMajorMinor,
                packageName: affectedPackage.id.name,
                packageVersion: affectedPackage.major,
                maxRunSeconds,
            }));
        }
        const dependentsToTest = runDependents ? common_1.shuffle(affectedPackages.dependentPackages).slice(0, runDependents) : [];
        if (comparisons.length) {
            const message = yield postInitialComparisonResults_1.postInitialComparisonResults({
                comparisons,
                dependentCount: dependentsToTest.length,
                dryRun: !shouldComment,
            });
            console.log('\n' + message + '\n');
        }
        const dependentComparisons = [];
        for (const affectedPackage of dependentsToTest) {
            console.log(`Comparing ${affectedPackage.id.name}/v${affectedPackage.major} because it depends on something that changed...\n\n`);
            dependentComparisons.push(yield compareBenchmarks({
                allPackages,
                definitelyTypedPath,
                typeScriptVersionMajorMinor,
                packageName: affectedPackage.id.name,
                packageVersion: affectedPackage.major,
                maxRunSeconds,
            }));
        }
        if (dependentComparisons.length) {
            const message = yield postDependentsComparisonResults_1.postDependentsComparisonResult({ comparisons: dependentComparisons, dryRun: !shouldComment });
            console.log('\n' + message + '\n');
        }
    });
}
exports.compare = compare;
function compareBenchmarks({ allPackages, definitelyTypedPath, typeScriptVersionMajorMinor, packageName, packageVersion, maxRunSeconds, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const { packageBenchmarks: container } = yield common_1.getDatabase("read" /* Read */);
        const latestBenchmarkDocument = yield query_1.getLatestBenchmark({
            container,
            typeScriptVersionMajorMinor,
            packageName,
            packageVersion,
        });
        let latestBenchmark = latestBenchmarkDocument && latestBenchmarkDocument.body;
        const packageId = { name: packageName, majorVersion: packageVersion };
        const changedPackagesBetweenLastRunAndMaster = latestBenchmark && (yield common_1.getChangedPackages({
            diffFrom: 'origin/master',
            diffTo: latestBenchmark.sourceVersion,
            definitelyTypedPath,
        }));
        if (changedPackagesBetweenLastRunAndMaster || !latestBenchmark) {
            let needsRerun = !latestBenchmark;
            if (changedPackagesBetweenLastRunAndMaster) {
                const affectedPackages = get_affected_packages_1.getAffectedPackages(allPackages, changedPackagesBetweenLastRunAndMaster);
                const affected = [...affectedPackages.changedPackages, ...affectedPackages.dependentPackages];
                needsRerun = affected.some(affectedPackage => common_1.packageIdsAreEqual(packageId, affectedPackage.id));
            }
            if (needsRerun) {
                console.log(`No previous benchmark for ${packageName}/v${packageVersion}. Checking out master and running one...`);
                yield util_1.execAndThrowErrors('git checkout origin/master', definitelyTypedPath);
                const latest = yield benchmark_1.benchmarkPackage(packageName, packageVersion.toString(), new Date(), {
                    definitelyTypedPath,
                    printSummary: false,
                    iterations: common_1.config.benchmarks.languageServiceIterations,
                    progress: false,
                    upload: true,
                    tsVersion: typeScriptVersionMajorMinor,
                    nProcesses: os.cpus().length,
                    failOnErrors: true,
                    installTypeScript: false,
                    maxRunSeconds,
                });
                yield util_1.execAndThrowErrors(`git checkout -`, definitelyTypedPath);
                latestBenchmark = latest && latest.summary;
            }
        }
        const currentBenchmark = (yield benchmark_1.benchmarkPackage(packageName, packageVersion.toString(), new Date(), {
            definitelyTypedPath,
            printSummary: true,
            iterations: common_1.config.benchmarks.languageServiceIterations,
            progress: false,
            upload: false,
            tsVersion: typeScriptVersionMajorMinor,
            nProcesses: os.cpus().length,
            failOnErrors: true,
            installTypeScript: false,
            maxRunSeconds,
        })).summary;
        if (latestBenchmark) {
            console.log('\nmaster');
            console.log('======');
            console.log(measure_1.printSummary([latestBenchmark]));
        }
        console.log('\nHEAD');
        console.log('====');
        console.log(measure_1.printSummary([currentBenchmark]));
        return [
            latestBenchmarkDocument || latestBenchmark && common_1.createDocument(latestBenchmark, common_1.config.database.packageBenchmarksDocumentSchemaVersion),
            common_1.createDocument(currentBenchmark, common_1.config.database.packageBenchmarksDocumentSchemaVersion),
        ];
    });
}
exports.compareBenchmarks = compareBenchmarks;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvY29tcGFyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0Isc0NBQTJPO0FBQzNPLG9DQUE4QztBQUU5QywyQ0FBK0M7QUFDL0Msd0RBQW1FO0FBQ25FLDRGQUF1RjtBQUN2Rix3Q0FBMEM7QUFDMUMsNERBQXlEO0FBQ3pELHlGQUFzRjtBQUN0RiwrRkFBMkY7QUFXM0YsU0FBc0IsT0FBTyxDQUFDLElBQVU7O1FBQ3RDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBWSxDQUFDLG9CQUFXLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQztRQUNwSSxNQUFNLDJCQUEyQixHQUFHLHFCQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pILE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxNQUFNLDBCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDckUsTUFBTSxlQUFlLEdBQUcsTUFBTSwyQkFBa0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBQ25HLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLHFCQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDeEYsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckMsTUFBTSxhQUFhLEdBQUcsSUFB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