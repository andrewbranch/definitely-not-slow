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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0VHlwZVNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tZWFzdXJlL2dldFR5cGVTY3JpcHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLCtCQUFpQztBQUNqQyxxREFBK0Y7QUFDL0YsTUFBTSxNQUFNLEdBQUcsZ0JBQVMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFcEMsU0FBc0IsYUFBYSxDQUNqQyxPQUFlLEVBQ2YsbUJBQTRCLEVBQzVCLE9BQU8sR0FBRyxJQUFJOztRQUVkLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsMEJBQWMsQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBQzFFLElBQUksT0FBTyxFQUFFO1lBQ1gsSUFBSSxPQUFPLEtBQUssTUFBTSxFQUFFO2dCQUN0QixNQUFNLHlCQUFhLEVBQUUsQ0FBQztnQkFDdEIsTUFBTSx1QkFBVyxFQUFFLENBQUM7YUFDckI7aUJBQU0sSUFBSSxDQUFDLENBQUEsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUEsRUFBRTtnQkFDaEMsTUFBTSxzQkFBVSxFQUFFLENBQUM7YUFDcEI7U0FDRjtRQUNELElBQUksQ0FBQyxDQUFBLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBLEVBQUU7WUFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLE9BQU8sd0JBQXdCLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDckU7UUFDRCxPQUFPO1lBQ0wsRUFBRSxFQUFFLHdEQUFhLE1BQU0sR0FBQztZQUN4QixNQUFNO1NBQ1AsQ0FBQztJQUNKLENBQUM7Q0FBQTtBQXJCRCxzQ0FxQkMifQ==