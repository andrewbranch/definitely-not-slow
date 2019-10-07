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
const benchmark_1 = require("./benchmark");
const getPackagesToBenchmark_1 = require("./getPackagesToBenchmark");
const compare_1 = require("./compare");
const compareTypeScript_1 = require("./compareTypeScript");
const entry = process.argv[2];
const args = common_1.deserializeArgs(process.argv.slice(3));
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        switch (entry) {
            case 'benchmark':
                return benchmark_1.benchmark(args);
            case 'getPackagesToBenchmark':
                return getPackagesToBenchmark_1.getPackagesToBenchmark(args);
            case 'compare':
                return compare_1.compare(args);
            case 'compareTypeScript':
                return compareTypeScript_1.compareTypeScriptCLI(args);
            default:
                console.error(`Unrecognized entry '${entry}'`);
        }
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}))();
process.on('unhandledRejection', err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2xpL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTRDO0FBQzVDLDJDQUF3QztBQUN4QyxxRUFBa0U7QUFDbEUsdUNBQW9DO0FBQ3BDLDJEQUEyRDtBQUczRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLE1BQU0sSUFBSSxHQUFHLHdCQUFlLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRCxDQUFDLEdBQVMsRUFBRTtJQUNWLElBQUk7UUFDRixRQUFRLEtBQUssRUFBRTtZQUNiLEtBQUssV0FBVztnQkFDZCxPQUFPLHFCQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekIsS0FBSyx3QkFBd0I7Z0JBQzNCLE9BQU8sK0NBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsS0FBSyxTQUFTO2dCQUNaLE9BQU8saUJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QixLQUFLLG1CQUFtQjtnQkFDdEIsT0FBTyx3Q0FBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQztnQkFDRSxPQUFPLENBQUMsS0FBSyxDQUFDLHVCQUF1QixLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQ2xEO0tBQ0Y7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtBQUNILENBQUMsQ0FBQSxDQUFDLEVBQUUsQ0FBQztBQUVMLE9BQU8sQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLEVBQUU7SUFDckMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDIn0=