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
        for (const affectedPackage of [...affectedPackages.changedPackages, ...affectedPackages.dependentPackages]) {
            console.log(`Comparing ${affectedPackage.id.name}/v${affectedPackage.major}...\n\n`);
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
                yield util_1.execAndThrowErrors('git checkout origin/master', definitelyTypedPath);
                latestBenchmark = (yield benchmark_1.benchmarkPackage(packageName, packageVersion.toString(), new Date(), {
                    definitelyTypedPath,
                    printSummary: false,
                    iterations: common_1.config.benchmarks.languageServiceIterations,
                    progress: true,
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
            progress: true,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvY29tcGFyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0Isc0NBQTRNO0FBQzVNLG9DQUE4QztBQUU5QywyQ0FBK0M7QUFDL0Msd0RBQW1FO0FBQ25FLDRGQUF1RjtBQUN2Rix3Q0FBcUQ7QUFVckQsU0FBc0IsT0FBTyxDQUFDLElBQVU7O1FBQ3RDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBWSxDQUFDLG9CQUFXLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQztRQUNwSSxNQUFNLDJCQUEyQixHQUFHLHFCQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pILE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxNQUFNLDBCQUFpQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDckUsTUFBTSxlQUFlLEdBQUcsTUFBTSwyQkFBa0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBQ25HLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDcEIsT0FBTztTQUNSO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRywyQ0FBbUIsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFDM0UsS0FBSyxNQUFNLGVBQWUsSUFBSSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsRUFBRTtZQUMxRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFB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