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
        const typeScriptVersionMajorMinor = common_1.assertString(args.typeScriptVersion ? args.typeScriptVersion.toString() : undefined, 'typeScriptVersion');
        const { allPackages } = yield common_1.getParsedPackages(definitelyTypedPath);
        const changedPackages = yield common_1.getChangedPackages({ diffTo: 'origin/master', definitelyTypedPath });
        const maxRunSeconds = args.maxRunSeconds ? common_1.assertNumber(args.maxRunSeconds) : undefined;
        const shouldComment = !!args.comment;
        const upload = !!args.upload;
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
                upload,
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
                upload,
            }));
        }
        if (dependentComparisons.length) {
            const message = yield postDependentsComparisonResults_1.postDependentsComparisonResult({ comparisons: dependentComparisons, dryRun: !shouldComment });
            console.log('\n' + message + '\n');
        }
    });
}
exports.compare = compare;
function compareBenchmarks({ allPackages, definitelyTypedPath, typeScriptVersionMajorMinor, packageName, packageVersion, maxRunSeconds, upload = true, }) {
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
                yield util_1.execAndThrowErrors('git checkout origin/master && git clean -xdf types', definitelyTypedPath);
                const latest = yield benchmark_1.benchmarkPackage(packageName, packageVersion.toString(), new Date(), {
                    definitelyTypedPath,
                    printSummary: false,
                    iterations: common_1.config.benchmarks.languageServiceIterations,
                    progress: false,
                    upload,
                    tsVersion: typeScriptVersionMajorMinor,
                    nProcesses: os.cpus().length,
                    failOnErrors: true,
                    installTypeScript: false,
                    maxRunSeconds,
                });
                yield util_1.execAndThrowErrors(`git checkout - && git clean -xdf types`, definitelyTypedPath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvY29tcGFyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0Isc0NBQTJPO0FBQzNPLG9DQUE4QztBQUU5QywyQ0FBK0M7QUFDL0Msd0RBQW1FO0FBQ25FLDRGQUF1RjtBQUN2Rix3Q0FBMEM7QUFDMUMsNERBQXlEO0FBQ3pELHlGQUFzRjtBQUN0RiwrRkFBMkY7QUFZM0YsU0FBc0IsT0FBTyxDQUFDLElBQVU7O1FBQ3RDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBWSxDQUFDLG9CQUFXLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQztRQUNwSSxNQUFNLDJCQUEyQixHQUFHLHFCQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQzlJLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxNQUFNLDBCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDckUsTUFBTSxlQUFlLEdBQUcsTUFBTSwyQkFBa0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBQ25HLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLHFCQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDeEYsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckMsTUFBTSxN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