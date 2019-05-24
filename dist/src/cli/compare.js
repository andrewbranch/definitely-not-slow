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
        getTypeScript_1.getTypeScript(typeScriptVersionMajorMinor);
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
        if (shouldComment && comparisons.length) {
            yield postInitialComparisonResults_1.postInitialComparisonResults(comparisons, affectedPackages.dependentPackages.length);
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
        if (shouldComment && dependentComparisons.length) {
            yield postDependentsComparisonResults_1.postDependentsComparisonResult(dependentComparisons);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvY29tcGFyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0Isc0NBQXNPO0FBQ3RPLG9DQUE4QztBQUU5QywyQ0FBK0M7QUFDL0Msd0RBQW1FO0FBQ25FLDRGQUF1RjtBQUN2Rix3Q0FBcUQ7QUFDckQsNERBQXlEO0FBQ3pELHlGQUFzRjtBQUN0RiwrRkFBMkY7QUFVM0YsU0FBc0IsT0FBTyxDQUFDLElBQVU7O1FBQ3RDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBWSxDQUFDLG9CQUFXLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQztRQUNwSSxNQUFNLDJCQUEyQixHQUFHLHFCQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pILE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxNQUFNLDBCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDckUsTUFBTSxlQUFlLEdBQUcsTUFBTSwyQkFBa0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBQ25HLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDcEIsT0FBTztTQUNSO1FBRUQsNkJBQWEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQzNDLE1BQU0sZ0JBQWdCLEdBQUcsMkNBQW1CLENBQUMsV0FBVyxFQUFFLGVBQWUsQ0FBQyxD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