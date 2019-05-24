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
        const shouldComment = !!args.comment;
        if (!changedPackages) {
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
            }));
        }
        if (comparisons.length) {
            const message = yield postInitialComparisonResults_1.postInitialComparisonResults({
                comparisons,
                dependentCount: affectedPackages.dependentPackages.length,
                dryRun: !shouldComment,
            });
            console.log('\n' + message + '\n');
        }
        const dependentComparisons = [];
        for (const affectedPackage of affectedPackages.dependentPackages) {
            console.log(`Comparing ${affectedPackage.id.name}/v${affectedPackage.major} because it depends on something that changed...\n\n`);
            dependentComparisons.push(yield compareBenchmarks({
                allPackages,
                definitelyTypedPath,
                typeScriptVersionMajorMinor,
                packageName: affectedPackage.id.name,
                packageVersion: affectedPackage.major,
            }));
        }
        if (dependentComparisons.length) {
            const message = yield postDependentsComparisonResults_1.postDependentsComparisonResult({ comparisons: dependentComparisons, dryRun: !shouldComment });
            console.log('\n' + message + '\n');
        }
    });
}
exports.compare = compare;
function compareBenchmarks({ allPackages, definitelyTypedPath, typeScriptVersionMajorMinor, packageName, packageVersion, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const { container } = yield common_1.getDatabase("read" /* Read */);
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
                latestBenchmark = measure_1.summarize((yield benchmark_1.benchmarkPackage(packageName, packageVersion.toString(), new Date(), {
                    definitelyTypedPath,
                    printSummary: true,
                    iterations: common_1.config.benchmarks.languageServiceIterations,
                    progress: true,
                    upload: true,
                    tsVersion: typeScriptVersionMajorMinor,
                    nProcesses: os.cpus().length,
                    failOnErrors: true,
                    installTypeScript: false,
                }))[0]);
                yield util_1.execAndThrowErrors(`git checkout -`);
            }
        }
        const currentBenchmark = (yield benchmark_1.benchmarkPackage(packageName, packageVersion.toString(), new Date(), {
            definitelyTypedPath,
            printSummary: true,
            iterations: common_1.config.benchmarks.languageServiceIterations,
            progress: true,
            upload: false,
            tsVersion: typeScriptVersionMajorMinor,
            nProcesses: os.cpus().length,
            failOnErrors: true,
            installTypeScript: false,
        }))[0];
        if (!latestBenchmark) {
            throw new Error('Failed to get a benchmark for master. This error should be impossible.');
        }
        const currentBenchmarkSummary = measure_1.summarize(currentBenchmark);
        console.log('\nmaster');
        console.log('======');
        console.log(measure_1.printSummary([latestBenchmark]));
        console.log('\nHEAD');
        console.log('====');
        console.log(measure_1.printSummary([currentBenchmarkSummary]));
        return [
            latestBenchmarkDocument || common_1.createDocument(latestBenchmark, common_1.config.database.packageBenchmarksDocumentSchemaVersion),
            common_1.createDocument(currentBenchmarkSummary, common_1.config.database.packageBenchmarksDocumentSchemaVersion),
        ];
    });
}
exports.compareBenchmarks = compareBenchmarks;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvY29tcGFyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0Isc0NBQXNPO0FBQ3RPLG9DQUE4QztBQUU5QywyQ0FBK0M7QUFDL0Msd0RBQW1FO0FBQ25FLDRGQUF1RjtBQUN2Rix3Q0FBcUQ7QUFDckQsNERBQXlEO0FBQ3pELHlGQUFzRjtBQUN0RiwrRkFBMkY7QUFVM0YsU0FBc0IsT0FBTyxDQUFDLElBQVU7O1FBQ3RDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBWSxDQUFDLG9CQUFXLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQztRQUNwSSxNQUFNLDJCQUEyQixHQUFHLHFCQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pILE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxNQUFNLDBCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDckUsTUFBTSxlQUFlLEdBQUcsTUFBTSwyQkFBa0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBQ25HLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDcEIsT0FBTztTQUNSO1FBRUQsTUFBTSw2QkFBYSxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDakQsTUFBTSxnQkFBZ0IsR0FBRywyQ0FBbUIsQ0FBQyxXQUFXLEVBQUUsZUFBZSxD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