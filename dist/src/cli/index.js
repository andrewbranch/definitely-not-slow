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
const benchmark_1 = require("./benchmark");
const getPackagesToBenchmark_1 = require("./getPackagesToBenchmark");
const compare_1 = require("./compare");
const compareTypeScript_1 = require("./compareTypeScript");
const entry = process.argv[2];
const args = common_1.deserializeArgs(process.argv.slice(3));
(() => __awaiter(this, void 0, void 0, function* () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2xpL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxzQ0FBNEM7QUFDNUMsMkNBQXdDO0FBQ3hDLHFFQUFrRTtBQUNsRSx1Q0FBb0M7QUFDcEMsMkRBQTJEO0FBRzNELE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsTUFBTSxJQUFJLEdBQUcsd0JBQWUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BELENBQUMsR0FBUyxFQUFFO0lBQ1YsSUFBSTtRQUNGLFFBQVEsS0FBSyxFQUFFO1lBQ2IsS0FBSyxXQUFXO2dCQUNkLE9BQU8scUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6QixLQUFLLHdCQUF3QjtnQkFDM0IsT0FBTywrQ0FBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0QyxLQUFLLFNBQVM7Z0JBQ1osT0FBTyxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZCLEtBQUssbUJBQW1CO2dCQUN0QixPQUFPLHdDQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDO2dCQUNFLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEtBQUssR0FBRyxDQUFDLENBQUM7U0FDbEQ7S0FDRjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0FBQ0gsQ0FBQyxDQUFBLENBQUMsRUFBRSxDQUFDO0FBRUwsT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLENBQUMsRUFBRTtJQUNyQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQyxDQUFDLENBQUMifQ==