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
function createDocument(body, version) {
    return {
        version,
        createdAt: new Date(),
        system: common_1.getSystemInfo(),
        body,
    };
}
function insertPackageBenchmark(benchmark, version, container) {
    return __awaiter(this, void 0, void 0, function* () {
        return container.items.create(createDocument(benchmark, version));
    });
}
exports.insertPackageBenchmark = insertPackageBenchmark;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvd3JpdGUvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBLHNDQUE2RTtBQUU3RSxTQUFTLGNBQWMsQ0FBSSxJQUFPLEVBQUUsT0FBZTtJQUNqRCxPQUFPO1FBQ0wsT0FBTztRQUNQLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRTtRQUNyQixNQUFNLEVBQUUsc0JBQWEsRUFBRTtRQUN2QixJQUFJO0tBQ0wsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFzQixzQkFBc0IsQ0FBQyxTQUFrQyxFQUFFLE9BQWUsRUFBRSxTQUFvQjs7UUFDcEgsT0FBTyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDcEUsQ0FBQztDQUFBO0FBRkQsd0RBRUMifQ==