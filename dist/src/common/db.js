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
const cosmos_1 = require("@azure/cosmos");
const config_1 = require("./config");
const util_1 = require("types-publisher/bin/util/util");
function getKey(accessLevel) {
    switch (accessLevel) {
        case "read" /* Read */:
            return config_1.config.database.readKey;
        case "write" /* Write */:
            return config_1.config.database.writeKey;
        default:
            util_1.assertNever(accessLevel);
    }
}
;
function getDatabase(accessLevel) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new cosmos_1.CosmosClient({
            endpoint: config_1.config.database.endpoint,
            key: getKey(accessLevel),
        });
        const { database } = yield client.databases.createIfNotExists({
            id: config_1.config.database.benchmarksDatabaseId,
        });
        const { container: packageBenchmarks } = yield database.containers.createIfNotExists({
            id: config_1.config.database.packageBenchmarksContainerId,
            partitionKey: {
                kind: 'Hash',
                paths: ['/body/packageName']
            }
        });
        const { container: typeScriptComparisons } = yield database.containers.createIfNotExists({
            id: config_1.config.database.typeScriptComparisonsContainerId,
        });
        return { database, packageBenchmarks, typeScriptComparisons };
    });
}
exports.getDatabase = getDatabase;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2RiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsMENBQWtFO0FBQ2xFLHFDQUFrQztBQUNsQyx3REFBNEQ7QUFPNUQsU0FBUyxNQUFNLENBQUMsV0FBZ0M7SUFDOUMsUUFBUSxXQUFXLEVBQUU7UUFDbkI7WUFDRSxPQUFPLGVBQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQ2pDO1lBQ0UsT0FBTyxlQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztRQUNsQztZQUNFLGtCQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDNUI7QUFDSCxDQUFDO0FBQUEsQ0FBQztBQUVGLFNBQXNCLFdBQVcsQ0FBQyxXQUFnQzs7UUFLaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxxQkFBWSxDQUFDO1lBQzlCLFFBQVEsRUFBRSxlQUFNLENBQUMsUUFBUSxDQUFDLFFBQVE7WUFDbEMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUM7U0FDekIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztZQUM1RCxFQUFFLEVBQUUsZUFBTSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0I7U0FDekMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxHQUFHLE1BQU0sUUFBUSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQztZQUNuRixFQUFFLEVBQUUsZUFBTSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEI7WUFDaEQsWUFBWSxFQUFFO2dCQUNaLElBQUksRUFBRSxNQUFNO2dCQUNaLEtBQUssRUFBRSxDQUFDLG1CQUFtQixDQUFDO2FBQzdCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxHQUFHLE1BQU0sUUFBUSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQztZQUN2RixFQUFFLEVBQUUsZUFBTSxDQUFDLFFBQVEsQ0FBQyxnQ0FBZ0M7U0FDckQsQ0FBQyxDQUFDO1FBRUgsT0FBTyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBRSxDQUFDO0lBQ2hFLENBQUM7Q0FBQTtBQTNCRCxrQ0EyQkMifQ==