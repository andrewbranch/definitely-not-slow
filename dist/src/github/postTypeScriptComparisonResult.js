"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const createTable_1 = require("./createTable");
function postTypeScriptComparisonResults({ comparisons, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = comparisons.map(([baseline, head]) => [
            `### ${common_1.toPackageKey(baseline.body.packageName, baseline.body.packageVersion)}`,
            createTable_1.createTable(baseline, head, baseline.body.typeScriptVersion, 'HEAD'),
        ].join('\n')).join('\n\n');
        return message;
    });
}
exports.postTypeScriptComparisonResults = postTypeScriptComparisonResults;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdFR5cGVTY3JpcHRDb21wYXJpc29uUmVzdWx0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dpdGh1Yi9wb3N0VHlwZVNjcmlwdENvbXBhcmlzb25SZXN1bHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHNDQUFxRjtBQUNyRiwrQ0FBNEM7QUFTNUMsU0FBc0IsK0JBQStCLENBQUMsRUFDcEQsV0FBVyxHQUM0Qjs7UUFDdkMsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNwRCxPQUFPLHFCQUFZLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUM5RSx5QkFBVyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUM7U0FDckUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFM0IsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztDQUFBO0FBVEQsMEVBU0MifQ==