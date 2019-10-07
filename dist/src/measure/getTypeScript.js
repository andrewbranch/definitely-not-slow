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
const installer_1 = require("dtslint/bin/installer");
const exists = util_1.promisify(fs.exists);
function getTypeScript(version, localTypeScriptPath, install = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const tsPath = path.resolve(installer_1.typeScriptPath(version, localTypeScriptPath));
        if (install) {
            if (version === 'next') {
                yield installer_1.cleanInstalls();
                yield installer_1.installNext();
            }
            else if (!(yield exists(tsPath))) {
                yield installer_1.installAll();
            }
        }
        if (!(yield exists(tsPath))) {
            throw new Error(`Version ${version} is not available at ${tsPath}`);
        }
        return {
            ts: yield Promise.resolve().then(() => __importStar(require(tsPath))),
            tsPath,
        };
    });
}
exports.getTypeScript = getTypeScript;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VHlwZVNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tZWFzdXJlL2dldFR5cGVTY3JpcHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsdUNBQXlCO0FBQ3pCLDJDQUE2QjtBQUM3QiwrQkFBaUM7QUFDakMscURBQStGO0FBQy9GLE1BQU0sTUFBTSxHQUFHLGdCQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRXBDLFNBQXNCLGFBQWEsQ0FDakMsT0FBZSxFQUNmLG1CQUE0QixFQUM1QixPQUFPLEdBQUcsSUFBSTs7UUFFZCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLDBCQUFjLENBQUMsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQztRQUMxRSxJQUFJLE9BQU8sRUFBRTtZQUNYLElBQUksT0FBTyxLQUFLLE1BQU0sRUFBRTtnQkFDdEIsTUFBTSx5QkFBYSxFQUFFLENBQUM7Z0JBQ3RCLE1BQU0sdUJBQVcsRUFBRSxDQUFDO2FBQ3JCO2lCQUFNLElBQUksQ0FBQyxDQUFBLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBLEVBQUU7Z0JBQ2hDLE1BQU0sc0JBQVUsRUFBRSxDQUFDO2FBQ3BCO1NBQ0Y7UUFDRCxJQUFJLENBQUMsQ0FBQSxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQSxFQUFFO1lBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxPQUFPLHdCQUF3QixNQUFNLEVBQUUsQ0FBQyxDQUFDO1NBQ3JFO1FBQ0QsT0FBTztZQUNMLEVBQUUsRUFBRSx3REFBYSxNQUFNLEdBQUM7WUFDeEIsTUFBTTtTQUNQLENBQUM7SUFDSixDQUFDO0NBQUE7QUFyQkQsc0NBcUJDIn0=