"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = __importDefault(require("@octokit/rest"));
const common_1 = require("../common");
let octokit;
function getOctokit() {
    return octokit || (octokit = new rest_1.default({
        auth: common_1.config.github.typeScriptBotAuthToken,
        userAgent: common_1.config.github.userAgent,
    }));
}
exports.getOctokit = getOctokit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0T2N0b2tpdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvZ2V0T2N0b2tpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHlEQUFvQztBQUNwQyxzQ0FBbUM7QUFFbkMsSUFBSSxPQUE0QixDQUFDO0FBQ2pDLFNBQWdCLFVBQVU7SUFDeEIsT0FBTyxPQUFPLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxjQUFPLENBQUM7UUFDdkMsSUFBSSxFQUFFLGVBQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCO1FBQzFDLFNBQVMsRUFBRSxlQUFNLENBQUMsTUFBTSxDQUFDLFNBQVM7S0FDbkMsQ0FBQyxDQUFDLENBQUM7QUFDTixDQUFDO0FBTEQsZ0NBS0MifQ==