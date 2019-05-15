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
function compare(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const definitelyTypedPath = path.resolve(common_1.assertString(common_1.withDefault(args.definitelyTypedPath, process.cwd()), 'definitelyTypedPath'));
        const typeScriptVersionMajorMinor = common_1.assertString(args.typeScriptVersion ? args.typeScriptVersion.toString() : undefined);
        const { allPackages } = yield common_1.getParsedPackages(definitelyTypedPath);
        const changedPackages = yield common_1.getChangedPackages({ diffTo: 'origin/master', definitelyTypedPath });
        if (!changedPackages) {
            return;
        }
        const affectedPackages = get_affected_packages_1.getAffectedPackages(allPackages, changedPackages);
        for (const affectedPackage of affectedPackages.changedPackages) {
            console.log(`Comparing ${affectedPackage.id.name}/v${affectedPackage.major} because it changed...\n\n`);
            yield compareBenchmarks({
                allPackages,
                definitelyTypedPath,
                typeScriptVersionMajorMinor,
                packageName: affectedPackage.id.name,
                packageVersion: affectedPackage.major,
            });
        }
        for (const affectedPackage of affectedPackages.dependentPackages) {
            console.log(`Comparing ${affectedPackage.id.name}/v${affectedPackage.major} because it depends on something that changed...\n\n`);
            yield compareBenchmarks({
                allPackages,
                definitelyTypedPath,
                typeScriptVersionMajorMinor,
                packageName: affectedPackage.id.name,
                packageVersion: affectedPackage.major,
            });
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
        if (!latestBenchmarkDocument) {
            return; //something
        }
        let latestBenchmark = latestBenchmarkDocument.body;
        const packageId = { name: packageName, majorVersion: packageVersion };
        const changedPackagesInPR = yield common_1.getChangedPackages({ diffTo: 'origin/master', definitelyTypedPath });
        if (!changedPackagesInPR) {
            return; // Nothing to do?
        }
        const changedPackagesBetweenLastRunAndMaster = yield common_1.getChangedPackages({
            diffFrom: 'origin/master',
            diffTo: latestBenchmarkDocument.body.sourceVersion,
            definitelyTypedPath,
        });
        if (changedPackagesBetweenLastRunAndMaster) {
            const affectedPackages = get_affected_packages_1.getAffectedPackages(allPackages, changedPackagesBetweenLastRunAndMaster);
            const affected = [...affectedPackages.changedPackages, ...affectedPackages.dependentPackages];
            const needsRerun = affected.some(affectedPackage => common_1.packageIdsAreEqual(packageId, affectedPackage.id));
            if (needsRerun) {
                const head = yield util_1.execAndThrowErrors('git rev-parse HEAD');
                console.log(`No previous benchmark for ${packageName}/${packageVersion}. Checking out master and running one...`);
                yield util_1.execAndThrowErrors('git checkout origin/master', definitelyTypedPath);
                latestBenchmark = (yield benchmark_1.benchmarkPackage(packageName, packageVersion.toString(), new Date(), {
                    definitelyTypedPath,
                    printSummary: false,
                    iterations: common_1.config.benchmarks.languageServiceIterations,
                    progress: false,
                    upload: true,
                    tsVersion: typeScriptVersionMajorMinor,
                    nProcesses: os.cpus().length,
                }))[0];
                yield util_1.execAndThrowErrors(`git checkout ${head}`);
            }
        }
        const currentBenchmark = (yield benchmark_1.benchmarkPackage(packageName, packageVersion.toString(), new Date(), {
            definitelyTypedPath,
            printSummary: false,
            iterations: common_1.config.benchmarks.languageServiceIterations,
            progress: false,
            upload: false,
            tsVersion: typeScriptVersionMajorMinor,
            nProcesses: os.cpus().length,
        }))[0];
        console.log('master');
        console.log('======\n');
        console.log(measure_1.printSummary('quickInfo' in latestBenchmark ? [latestBenchmark] : [measure_1.summarize(latestBenchmark)]));
        console.log('\n');
        console.log('HEAD');
        console.log('====\n');
        console.log(measure_1.printSummary([measure_1.summarize(currentBenchmark)]));
    });
}
exports.compareBenchmarks = compareBenchmarks;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvY29tcGFyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0Isc0NBQTRNO0FBQzVNLG9DQUE4QztBQUU5QywyQ0FBK0M7QUFDL0Msd0RBQW1FO0FBQ25FLDRGQUF1RjtBQUN2Rix3Q0FBcUQ7QUFVckQsU0FBc0IsT0FBTyxDQUFDLElBQVU7O1FBQ3RDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBWSxDQUFDLG9CQUFXLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQztRQUNwSSxNQUFNLDJCQUEyQixHQUFHLHFCQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pILE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxNQUFNLDBCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDckUsTUFBTSxlQUFlLEdBQUcsTUFBTSwyQkFBa0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBQ25HLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDcEIsT0FBTztTQUNSO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRywyQ0FBbUIsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDM0UsS0FBSyxNQUFNLGVBQWUsSUFBSSxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUU7WUFDOUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLGVBQWUsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLGVBQWUsQ0FBQyxL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