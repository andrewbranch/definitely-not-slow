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
function getLatestBenchmark({ container, packageName, packageVersion, typeScriptVersionMajorMinor, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield container.items.query({
            query: `SELECT TOP 1 * FROM ${common_1.config.database.packageBenchmarksContainerId} b` +
                `  WHERE b.body.packageName = @packageName` +
                `  AND b.body.packageVersion = @packageVersion` +
                `  AND b.body.typeScriptVersionMajorMinor = @tsVersion` +
                `  ORDER BY b.createdAt DESC`,
            parameters: [
                { name: '@packageName', value: packageName },
                { name: '@packageVersion', value: packageVersion.toString() },
                { name: '@tsVersion', value: typeScriptVersionMajorMinor },
            ],
        }, { enableCrossPartitionQuery: true }).current();
        return response.result;
    });
}
exports.getLatestBenchmark = getLatestBenchmark;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcXVlcnkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBLHNDQUFtRjtBQVNuRixTQUFzQixrQkFBa0IsQ0FBQyxFQUN2QyxTQUFTLEVBQ1QsV0FBVyxFQUNYLGNBQWMsRUFDZCwyQkFBMkIsR0FDRDs7UUFDMUIsTUFBTSxRQUFRLEdBQUcsTUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUMzQyxLQUFLLEVBQ0gsdUJBQXVCLGVBQU0sQ0FBQyxRQUFRLENBQUMsNEJBQTRCLElBQUk7Z0JBQ3ZFLDJDQUEyQztnQkFDM0MsK0NBQStDO2dCQUMvQyx1REFBdUQ7Z0JBQ3ZELDZCQUE2QjtZQUMvQixVQUFVLEVBQUU7Z0JBQ1YsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUU7Z0JBQzVDLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLEtBQUssRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQzdELEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsMkJBQTJCLEVBQUU7YUFDM0Q7U0FDRixFQUFFLEVBQUUseUJBQXlCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUVsRCxPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUM7SUFDekIsQ0FBQztDQUFBO0FBckJELGdEQXFCQyJ9