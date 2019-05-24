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
const util_1 = require("util");
const installer_1 = require("dtslint/bin/installer");
const exists = util_1.promisify(fs.exists);
function getTypeScript(version, localTypeScriptPath, install = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = installer_1.typeScriptPath(version, localTypeScriptPath);
        if (install) {
            if (version === 'next') {
                yield installer_1.cleanInstalls();
                yield installer_1.installNext();
            }
            else if (!(yield exists(path))) {
                yield installer_1.installAll();
            }
        }
        if (!(yield exists(path))) {
            throw new Error(`Version ${version} is not available`);
        }
        return {
            ts: yield Promise.resolve().then(() => __importStar(require(path))),
            tsPath: path,
        };
    });
}
exports.getTypeScript = getTypeScript;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VHlwZVNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tZWFzdXJlL2dldFR5cGVTY3JpcHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsK0JBQWlDO0FBQ2pDLHFEQUErRjtBQUMvRixNQUFNLE1BQU0sR0FBRyxnQkFBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUVwQyxTQUFzQixhQUFhLENBQ2pDLE9BQWUsRUFDZixtQkFBNEIsRUFDNUIsT0FBTyxHQUFHLElBQUk7O1FBRWQsTUFBTSxJQUFJLEdBQUcsMEJBQWMsQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUMxRCxJQUFJLE9BQU8sRUFBRTtZQUNYLElBQUksT0FBTyxLQUFLLE1BQU0sRUFBRTtnQkFDdEIsTUFBTSx5QkFBYSxFQUFFLENBQUM7Z0JBQ3RCLE1BQU0sdUJBQVcsRUFBRSxDQUFDO2FBQ3JCO2lCQUFNLElBQUksQ0FBQyxDQUFBLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBLEVBQUU7Z0JBQzlCLE1BQU0sc0JBQVUsRUFBRSxDQUFDO2FBQ3BCO1NBQ0Y7UUFDRCxJQUFJLENBQUMsQ0FBQSxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQSxFQUFFO1lBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxPQUFPLG1CQUFtQixDQUFDLENBQUM7U0FDeEQ7UUFDRCxPQUFPO1lBQ0wsRUFBRSxFQUFFLHdEQUFhLElBQUksR0FBQztZQUN0QixNQUFNLEVBQUUsSUFBSTtTQUNiLENBQUM7SUFDSixDQUFDO0NBQUE7QUFyQkQsc0NBcUJDIn0=