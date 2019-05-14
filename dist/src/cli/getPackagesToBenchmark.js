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
const test_runner_1 = require("types-publisher/bin/tester/test-runner");
const get_affected_packages_1 = require("types-publisher/bin/tester/get-affected-packages");
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
        const { container } = yield common_1.getDatabase("read" /* Read */);
        const changedPackages = yield util_2.nAtATime(10, allPackages.allTypings(), (typingsData) => __awaiter(this, void 0, void 0, function* () {
            const response = yield container.items.query({
                query: `SELECT TOP 1 * FROM ${common_1.config.database.packageBenchmarksContainerId} b` +
                    `  WHERE b.body.packageName = @packageName` +
                    `  AND b.body.packageVersion = @packageVersion` +
                    `  AND b.body.typeScriptVersionMajorMinor = @tsVersion` +
                    `  ORDER BY b.createdAt DESC`,
                parameters: [
                    { name: '@packageName', value: typingsData.id.name },
                    { name: '@packageVersion', value: typingsData.id.majorVersion.toString() },
                    { name: '@tsVersion', value: typeScriptVersionMajorMinor },
                ],
            }, { enableCrossPartitionQuery: true }).current();
            // No previous run exists; run one
            if (!response.result) {
                return typingsData.id;
            }
            const result = response.result;
            // System specs are different; run it
            if (result.system.hash !== currentSystem.hash) {
                console.log(`Queueing ${typingsData.id.name}/${typingsData.id.majorVersion} due to system change`);
                return typingsData.id;
            }
            const diff = yield util_2.execAndThrowErrors(`git diff --name-status ${result.body.sourceVersion}`, definitelyTypedPath);
            if (!diff) {
                return undefined;
            }
            const changes = diff.split('\n').map(line => {
                const [status, file] = line.split(/\s+/, 2);
                return { status: status.trim(), file: file.trim() };
            });
            const changedPackages = yield test_runner_1.gitChanges(changes);
            if (changedPackages.some(changedPackage => changedPackage.name === typingsData.id.name && changedPackage.majorVersion === typingsData.id.majorVersion)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UGFja2FnZXNUb0JlbmNobWFyay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGkvZ2V0UGFja2FnZXNUb0JlbmNobWFyay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFDN0IsK0JBQWlDO0FBQ2pDLHNDQUFxTDtBQUNyTCx3REFBNkU7QUFDN0Usd0VBQW9FO0FBQ3BFLDRGQUF1RjtBQUd2RixNQUFNLFNBQVMsR0FBRyxnQkFBUyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMxQyxNQUFNLGFBQWEsR0FBRyxzQkFBYSxFQUFFLENBQUM7QUFTdEMsU0FBUyxXQUFXLENBQUMsSUFBVTtJQUM3QixNQUFNLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1RCxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLDJFQUEyRSxDQUFDLENBQUM7S0FDOUY7SUFDRCxNQUFNLE1BQU0sR0FBRyxxQkFBWSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUM5RixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbkcsT0FBTztRQUNMLG1CQUFtQjtRQUNuQixVQUFVLEVBQUUscUJBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQztRQUN2RCwyQkFBMkIs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