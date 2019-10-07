"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UGFja2FnZXNUb0JlbmNobWFyay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvZ2V0UGFja2FnZXNUb0JlbmNobWFyay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLCtCQUFpQztBQUNqQyxzQ0FBeU07QUFDek0sd0RBQXlEO0FBQ3pELDRGQUF1RjtBQUd2RixvQ0FBOEM7QUFDOUMsTUFBTSxTQUFTLEdBQUcsZ0JBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDMUMsTUFBTSxhQUFhLEdBQUcsc0JBQWEsRUFBRSxDQUFDO0FBU3RDLFNBQVMsV0FBVyxDQUFDLElBQVU7SUFDN0IsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLElBQUksRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDNUQsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDckMsTUFBTSxJQUFJLEtBQUssQ0FBQywyRUFBMkUsQ0FBQyxDQUFDO0tBQzlGO0lBQ0QsTUFBTSxNQUFNLEdBQUcscUJBQVksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLHFCQUFxQixDQUFDLENBQUM7SUFDOUYsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25HLE9BQU87UUFDTCxtQkFBbUI7UUFDbkIsVUFBVSxFQUFFLHFCQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUM7UUFDdkQsMkJBQTJC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