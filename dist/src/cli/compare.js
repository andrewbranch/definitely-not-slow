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
                maxRunSeconds,
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
                    progress: false,
                    upload: true,
                    tsVersion: typeScriptVersionMajorMinor,
                    nProcesses: os.cpus().length,
                    failOnErrors: true,
                    installTypeScript: false,
                    maxRunSeconds,
                }))[0]);
                yield util_1.execAndThrowErrors(`git checkout -`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvY29tcGFyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0Isc0NBQW9QO0FBQ3BQLG9DQUE4QztBQUU5QywyQ0FBK0M7QUFDL0Msd0RBQW1FO0FBQ25FLDRGQUF1RjtBQUN2Rix3Q0FBcUQ7QUFDckQsNERBQXlEO0FBQ3pELHlGQUFzRjtBQUN0RiwrRkFBMkY7QUFXM0YsU0FBc0IsT0FBTyxDQUFDLElBQVU7O1FBQ3RDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBWSxDQUFDLG9CQUFXLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQztRQUNwSSxNQUFNLDJCQUEyQixHQUFHLHFCQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pILE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxNQUFNLDBCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDckUsTUFBTSxlQUFlLEdBQUcsTUFBTSwyQkFBa0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBQ25HLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLHFCQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDeEYsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDckMsSUFBSSxDQUFDLGVBQWUsRUFB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