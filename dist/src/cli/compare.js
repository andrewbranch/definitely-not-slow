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
function compare(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const definitelyTypedPath = path.resolve(common_1.assertString(common_1.withDefault(args.definitelyTypedPath, process.cwd()), 'definitelyTypedPath'));
        const typeScriptVersionMajorMinor = common_1.assertString(args.typeScriptVersion ? args.typeScriptVersion.toString() : undefined);
        const { allPackages } = yield common_1.getParsedPackages(definitelyTypedPath);
        const changedPackages = yield common_1.getChangedPackages({ diffTo: 'origin/master', definitelyTypedPath });
        if (!changedPackages) {
            return;
        }
        getTypeScript_1.getTypeScript(typeScriptVersionMajorMinor);
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
        let latestBenchmark = latestBenchmarkDocument && latestBenchmarkDocument.body;
        const packageId = { name: packageName, majorVersion: packageVersion };
        const changedPackagesInPR = yield common_1.getChangedPackages({ diffTo: 'origin/master', definitelyTypedPath });
        if (!changedPackagesInPR) {
            return; // Nothing to do?
        }
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
                console.log(`No previous benchmark for ${packageName}/${packageVersion}. Checking out master and running one...`);
                yield util_1.execAndThrowErrors('git checkout origin/master', definitelyTypedPath);
                latestBenchmark = (yield benchmark_1.benchmarkPackage(packageName, packageVersion.toString(), new Date(), {
                    definitelyTypedPath,
                    printSummary: true,
                    iterations: common_1.config.benchmarks.languageServiceIterations,
                    progress: true,
                    upload: true,
                    tsVersion: typeScriptVersionMajorMinor,
                    nProcesses: os.cpus().length,
                    failOnErrors: true,
                    installTypeScript: false,
                }))[0];
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
        console.log('\nmaster');
        console.log('======');
        console.log(measure_1.printSummary('quickInfo' in latestBenchmark ? [latestBenchmark] : [measure_1.summarize(latestBenchmark)]));
        console.log('\nHEAD');
        console.log('====');
        console.log(measure_1.printSummary([measure_1.summarize(currentBenchmark)]));
    });
}
exports.compareBenchmarks = compareBenchmarks;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvY29tcGFyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0Isc0NBQTRNO0FBQzVNLG9DQUE4QztBQUU5QywyQ0FBK0M7QUFDL0Msd0RBQW1FO0FBQ25FLDRGQUF1RjtBQUN2Rix3Q0FBcUQ7QUFDckQsNERBQXlEO0FBVXpELFNBQXNCLE9BQU8sQ0FBQyxJQUFVOztRQUN0QyxNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQVksQ0FBQyxvQkFBVyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7UUFDcEksTUFBTSwyQkFBMkIsR0FBRyxxQkFBWSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6SCxNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsTUFBTSwwQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sZUFBZSxHQUFHLE1BQU0sMkJBQWtCLENBQUMsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLG1CQUFtQixFQUFFLENBQUMsQ0FBQztRQUNuRyxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3BCLE9BQU87U0FDUjtRQUVELDZCQUFhLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUMzQyxNQUFNLGdCQUFnQixHQUFHLDJDQUFtQixDQUFDLFdBQVcsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUMzRSxLQUFLLE1BQU0sZUFBZSxJQUFJLGdCQUFnQixDQUFDLGVBQWUsRUFBRTtZQUM5RCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsZUFBZSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssZUFBZSxDQUFDLEtBQUssNEJBQTRCLENBQUMsQ0FBQztZQUN4RyxNQUFNLGlCQUFpQixDQUFDO2dCQUN0QixXQUFXO2dCQUNYLG1CQUFtQjtnQkFDbkIsMkJBQTJCO2dCQUMzQixXQUFXLEVBQUUsZUFBZSxDQUFDLEVBQUUsQ0FBQyxJQUFJO2dCQUNwQyxjQUFjLEVBQUUsZUFBZSxDQUFDLEtBQUs7YUFDdEMsQ0FBQyxDQUFDO1NBQ0o7UUFDRCxLQUFLLE1BQU0sZUFBZSxJQUFJLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFO1lBQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxlQUFlLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxlQUFlLENBQUMsS0FBSyxzREFBc0QsQ0FBQyxDQUFDO1lBQ2xJLE1BQU0saUJBQWlCLENBQUM7Z0JBQ3RCLFdBQVc7Z0JBQ1gsbUJBQW1CO2dCQUNuQiwyQkFBMkI7Z0JBQzNCLFdBQVcsRUFBRSxlQUFlLENBQUMsRUFBRSxDQUFDLElBQUk7Z0JBQ3BDLGNBQWMsRUFBRSxlQUFlLENBQUMsS0FBSzthQUN0QyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7Q0FBQTtBQS9CRCwwQkErQkM7QUFFRCxTQUFzQixpQkFBaUIsQ0FBQyxFQUN0QyxXQUFXLEVBQ1gsbUJBQW1CLEVBQ25CLDJCQUEyQixFQUMzQixXQUFXLEVBQ1gsY0FBYyxHQUNDOztRQUNmLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLG9CQUFXLG1CQUEwQixDQUFDO1FBQ2xFLE1BQU0sdUJBQXVCLEdBQUcsTUFBTSwwQkFBa0IsQ0FBQztZQUN2RCxTQUFTO1lBQ1QsMkJBQTJCO1lBQzNCLFdBQVc7WUFDWCxjQUFjO1NBQ2YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxlQUFlLEdBQTJELHVCQUF1QixJQUFJLHVCQUF1QixDQUFDLElBQUksQ0FBQztRQUN0SSxNQUFNLFNBQVMsR0FBRyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxDQUFDO1FBQ3RFLE1BQU0sbUJBQW1CLEdBQUcsTUFBTSwyQkFBa0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZHLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUN4QixPQUFPLENBQUMsaUJBQWlCO1NBQzFCO1FBRUQsTUFBTSxzQ0FBc0MsR0FBRyxlQUFlLEtBQUksTUFBTSwyQkFBa0IsQ0FBQztZQUN6RixRQUFRLEVBQUUsZUFBZTtZQUN6QixNQUFNLEVBQUUsZUFBZSxDQUFDLGFBQWE7WUFDckMsbUJBQW1CO1NBQ3BCLENBQUMsQ0FBQSxDQUFDO1FBRUgsSUFBSSxzQ0FBc0MsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUM5RCxJQUFJLFVBQVUsR0FBRyxDQUFDLGVBQWUsQ0FBQztZQUNsQyxJQUFJLHNDQUFzQyxFQUFFO2dCQUMxQyxNQUFNLGdCQUFnQixHQUFHLDJDQUFtQixDQUFDLFdBQVcsRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDO2dCQUNsRyxNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDOUYsVUFBVSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQywyQkFBa0IsQ0FBQyxTQUFTLEVBQUUsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDbEc7WUFDRCxJQUFJLFVBQVUsRUFBRTtnQkFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixXQUFXLElBQUksY0FBYywwQ0FBMEMsQ0FBQyxDQUFDO2dCQUNsSCxNQUFNLHlCQUFrQixDQUFDLDRCQUE0QixFQUFFLG1CQUFtQixDQUFDLENBQUM7Z0JBQzVFLGVBQWUsR0FBRyxDQUFDLE1BQU0sNEJBQWdCLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLElBQUksRUFBRSxFQUFFO29CQUM1RixtQkFBbUI7b0JBQ25CLFlBQVksRUFBRSxJQUFJO29CQUNsQixVQUFVLEVBQUUsZUFBTSxDQUFDLFVBQVUsQ0FBQyx5QkFBeUI7b0JBQ3ZELFFBQVEsRUFBRSxJQUFJO29CQUNkLE1BQU0sRUFBRSxJQUFJO29CQUNaLFNBQVMsRUFBRSwyQkFBMkI7b0JBQ3RDLFVBQVUsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTTtvQkFDNUIsWUFBWSxFQUFFLElBQUk7b0JBQ2xCLGlCQUFpQixFQUFFLEtBQUs7aUJBQ3pCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNQLE1BQU0seUJBQWtCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzthQUM1QztTQUNGO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLE1BQU0sNEJBQWdCLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLElBQUksRUFBRSxFQUFFO1lBQ25HLG1CQUFtQjtZQUNuQixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsZUFBTSxDQUFDLFVBQVUsQ0FBQyx5QkFBeUI7WUFDdkQsUUFBUSxFQUFFLElBQUk7WUFDZCxNQUFNLEVBQUUsS0FBSztZQUNiLFNBQVMsRUFBRSwyQkFBMkI7WUFDdEMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNO1lBQzVCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLGlCQUFpQixFQUFFLEtBQUs7U0FDekIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFUCxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3BCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0VBQXdFLENBQUMsQ0FBQztTQUMzRjtRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFZLENBQUMsV0FBVyxJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxtQkFBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFZLENBQUMsQ0FBQyxtQkFBUyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQztDQUFBO0FBM0VELDhDQTJFQyJ9