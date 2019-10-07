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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = __importStar(require("os"));
const packages_1 = require("types-publisher/bin/lib/packages");
const get_definitely_typed_1 = require("types-publisher/bin/get-definitely-typed");
const logging_1 = require("types-publisher/bin/util/logging");
const common_1 = require("types-publisher/bin/lib/common");
const parse_definitions_1 = __importDefault(require("types-publisher/bin/parse-definitions"));
const utils_1 = require("./utils");
let parsedSourceVersion;
function getParsedPackages(definitelyTypedPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentSourceVersion = yield utils_1.getSourceVersion(definitelyTypedPath);
        const definitelyTypedFS = get_definitely_typed_1.getLocallyInstalledDefinitelyTyped(definitelyTypedPath);
        const isDebugging = process.execArgv.some(arg => arg.startsWith('--inspect'));
        const needsReparse = !parsedSourceVersion || parsedSourceVersion !== currentSourceVersion;
        if (process.env.NODE_ENV === 'production' || needsReparse || !(yield utils_1.pathExists(common_1.dataFilePath(packages_1.typesDataFilename)))) {
            yield parse_definitions_1.default(definitelyTypedFS, isDebugging ? undefined : {
                definitelyTypedPath,
                nProcesses: os.cpus().length,
            }, logging_1.consoleLogger);
            parsedSourceVersion = currentSourceVersion;
        }
        const allPackages = yield packages_1.AllPackages.read(definitelyTypedFS);
        return { definitelyTypedFS, allPackages };
    });
}
exports.getParsedPackages = getParsedPackages;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0UGFyc2VkUGFja2FnZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2dldFBhcnNlZFBhY2thZ2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QiwrREFBa0Y7QUFDbEYsbUZBQWtHO0FBQ2xHLDhEQUFpRTtBQUNqRSwyREFBOEQ7QUFDOUQsOEZBQXFFO0FBQ3JFLG1DQUF1RDtBQUV2RCxJQUFJLG1CQUF1QyxDQUFDO0FBQzVDLFNBQXNCLGlCQUFpQixDQUFDLG1CQUEyQjs7UUFJakUsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLHdCQUFnQixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDekUsTUFBTSxpQkFBaUIsR0FBRyx5REFBa0MsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ2xGLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzlFLE1BQU0sWUFBWSxHQUFHLENBQUMsbUJBQW1CLElBQUksbUJBQW1CLEtBQUssb0JBQW9CLENBQUM7UUFDMUYsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxZQUFZLElBQUksWUFBWSxJQUFJLENBQUMsQ0FBQyxNQUFNLGtCQUFVLENBQUMscUJBQVksQ0FBQyw0QkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNqSCxNQUFNLDJCQUFnQixDQUFDLGlCQUFpQixFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDbEUsbUJBQW1CO2dCQUNuQixVQUFVLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU07YUFDN0IsRUFBRSx1QkFBYSxDQUFDLENBQUM7WUFDbEIsbUJBQW1CLEdBQUcsb0JBQW9CLENBQUM7U0FDNUM7UUFDRCxNQUFNLFdBQVcsR0FBRyxNQUFNLHNCQUFXLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDOUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxDQUFDO0lBQzVDLENBQUM7Q0FBQTtBQWpCRCw4Q0FpQkMifQ==