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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const common_1 = require("../common");
const util_2 = require("types-publisher/bin/util/util");
const get_affected_packages_1 = require("types-publisher/bin/tester/get-affected-packages");
const query_1 = require("../query");
const writeFile = util_1.promisify(fs.writeFile);
const currentSystem = common_1.getSystemInfo();
function convertArgs(args) {
    const tsVersion = (args.typeScriptVersion || '').toString();
    if (tsVersion.split('.').length !== 2) {
        throw new Error(`Argument 'typeScriptVersion' must be in format 'major.minor' (e.g. '3.1')`);
    }
    const dtPath = common_1.assertString(args.definitelyTypedPath || process.cwd(), 'definitelyTypedPath');
    const definitelyTypedPath = path.isAbsolute(dtPath) ? dtPath : path.resolve(process.cwd(), dtPath);
    return {
        definitelyTypedPath,
        agentCount: common_1.assertNumber(args.agentCount, 'agentCount'),
        typeScriptVersionMajorMinor: tsVersion,
        outFile: common_1.assertString(args.outFile, 'outFile'),
    };
}
function getPackagesToBenchmark(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { definitelyTypedPath, agentCount, typeScriptVersionMajorMinor, outFile, } = convertArgs(args);
        const { allPackages } = yield common_1.getParsedPackages(definitelyTypedPath);
        const { packageBenchmarks: container } = yield common_1.getDatabase("read" /* Read */);
        const changedPackages = yield util_2.nAtATime(10, allPackages.allTypings(), (typingsData) => __awaiter(this, void 0, void 0, function* () {
            const result = yield query_1.getLatestBenchmark({
                container,
                typeScriptVersionMajorMinor,
                packageName: typingsData.id.name,
                packageVersion: typingsData.id.majorVersion,
            });
            // No previous run exists; run one
            if (!result) {
                return typingsData.id;
            }
            // System specs are different; run it
            if (!common_1.systemsAreCloseEnough(result.system, currentSystem)) {
                console.log(`Queueing ${typingsData.id.name}/${typingsData.id.majorVersion} due to system change`);
                return typingsData.id;
            }
            const changedPackages = yield common_1.getChangedPackages({ diffTo: result.body.sourceVersion, definitelyTypedPath });
            if (!changedPackages) {
                return undefined;
            }
            if (changedPackages.some(common_1.packageIdsAreEqual(typingsData.id))) {
                // Package has changed; run it
                return typingsData.id;
            }
        }));
        const affectedPackages = get_affected_packages_1.getAffectedPackages(allPackages, common_1.compact(changedPackages));
        const packagesToBenchmark = [...affectedPackages.changedPackages, ...affectedPackages.dependentPackages];
        const groups = packagesToBenchmark.reduce((groups, typingsData, index) => {
            const agentIndex = index % agentCount;
            if (groups[agentIndex]) {
                groups[agentIndex].push(typingsData.id);
            }
            else {
                groups[agentIndex] = [typingsData.id];
            }
            return groups;
        }, []);
        const benchmarkOptions = {
            definitelyTypedPath,
            tsVersion: typeScriptVersionMajorMinor,
            upload: true,
        };
        yield writeFile(outFile, JSON.stringify({
            changedPackageCount: affectedPackages.changedPackages.length,
            dependentPackageCount: affectedPackages.dependentPackages.length,
            totalPackageCount: packagesToBenchmark.length,
            system: currentSystem,
            options: benchmarkOptions,
            groups,
        }, undefined, 2), 'utf8');
    });
}
exports.getPackagesToBenchmark = getPackagesToBenchmark;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UGFja2FnZXNUb0JlbmNobWFyay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvZ2V0UGFja2FnZXNUb0JlbmNobWFyay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0IsK0JBQWlDO0FBQ2pDLHNDQUF5TTtBQUN6TSx3REFBeUQ7QUFDekQsNEZBQXVGO0FBR3ZGLG9DQUE4QztBQUM5QyxNQUFNLFNBQVMsR0FBRyxnQkFBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMxQyxNQUFNLGFBQWEsR0FBRyxzQkFBYSxFQUFFLENBQUM7QUFTdEMsU0FBUyxXQUFXLENBQUMsSUFBVTtJQUM3QixNQUFNLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1RCxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLDJFQUEyRSxDQUFDLENBQUM7S0FDOUY7SUFDRCxNQUFNLE1BQU0sR0FBRyxxQkFBWSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUM5RixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbkcsT0FBTztRQUNMLG1CQUFtQjtRQUNuQixVQUFVLEVBQUUscUJBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQztRQUN2RCwyQkFBMkIs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