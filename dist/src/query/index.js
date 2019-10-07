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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcXVlcnkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFDQSxzQ0FBbUY7QUFTbkYsU0FBc0Isa0JBQWtCLENBQUMsRUFDdkMsU0FBUyxFQUNULFdBQVcsRUFDWCxjQUFjLEVBQ2QsMkJBQTJCLEdBQ0Q7O1FBQzFCLE1BQU0sUUFBUSxHQUFHLE1BQU0sU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7WUFDM0MsS0FBSyxFQUNILHVCQUF1QixlQUFNLENBQUMsUUFBUSxDQUFDLDRCQUE0QixJQUFJO2dCQUN2RSwyQ0FBMkM7Z0JBQzNDLCtDQUErQztnQkFDL0MsdURBQXVEO2dCQUN2RCw2QkFBNkI7WUFDL0IsVUFBVSxFQUFFO2dCQUNWLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFO2dCQUM1QyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsY0FBYyxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUM3RCxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLDJCQUEyQixFQUFFO2FBQzNEO1NBQ0YsRUFBRSxFQUFFLHlCQUF5QixFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFbEQsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBQ3pCLENBQUM7Q0FBQTtBQXJCRCxnREFxQkMifQ==