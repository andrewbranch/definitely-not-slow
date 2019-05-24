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
const getOctokit_1 = require("./getOctokit");
const util_1 = require("types-publisher/bin/util/util");
const createTablesWithAnalysesMessage_1 = require("./createTablesWithAnalysesMessage");
function postInitialComparisonResults(comparisons, dependentCount) {
    return __awaiter(this, void 0, void 0, function* () {
        const prNumber = parseInt(util_1.assertDefined(process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER, `Required environment variable 'SYSTEM_PULLREQUEST_PULLREQUESTNUMBER' was not set.`), 10);
        const octokit = getOctokit_1.getOctokit();
        return octokit.issues.createComment(Object.assign({}, common_1.config.github.commonParams, { issue_number: prNumber, body: common_1.compact([
                `👋 **Hi there!** I’ve run some quick performance metrics against master and your PR. **This is still an experiment**, so don’t panic if I say something crazy! I’m still learning how to interpret these metrics. 😄`,
                ``,
                getDependentsMessage(dependentCount),
                ``,
                `Let’s review the numbers, shall we?`,
                ``,
                createTablesWithAnalysesMessage_1.createTablesWithAnalysesMessage(comparisons, prNumber),
                ``,
                `---`,
                'If you have any questions or comments about me, you can ping [`@andrewbranch`](https://github.com/andrewbranch). Have a nice day!',
            ]).join('\n') }));
    });
}
exports.postInitialComparisonResults = postInitialComparisonResults;
function getDependentsMessage(dependentCount) {
    if (dependentCount) {
        return `I’m still measuring **${dependentCount} other package${dependentCount === 1 ? '' : 's'}** that depend${dependentCount === 1 ? 's' : ''} on these typings, and will post another comment with those results when I’m done. But in the meantime, you can go ahead and see the results of what you directly changed in this PR.`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdEluaXRpYWxDb21wYXJpc29uUmVzdWx0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvcG9zdEluaXRpYWxDb21wYXJpc29uUmVzdWx0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsc0NBQStFO0FBQy9FLDZDQUEwQztBQUMxQyx3REFBOEQ7QUFDOUQsdUZBQW9GO0FBSXBGLFNBQXNCLDRCQUE0QixDQUFDLFdBQTZCLEVBQUUsY0FBc0I7O1FBQ3RHLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxvQkFBYSxDQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxFQUNoRCxtRkFBbUYsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTVGLE1BQU0sT0FBTyxHQUFHLHVCQUFVLEVBQUUsQ0FBQztRQUM3QixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxtQkFDOUIsZUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQzdCLFlBQVksRUFBRSxRQUFRLEVBQ3RCLElBQUksRUFBRSxnQkFBTyxDQUFDO2dCQUNaLHNOQUFzTjtnQkFDdE4sRUFBRTtnQkFDRixvQkFBb0IsQ0FBQyxjQUFjLENBQUM7Z0JBQ3BDLEVBQUU7Z0JBQ0YscUNBQXFDO2dCQUNyQyxFQUFFO2dCQUNGLGlFQUErQixDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUM7Z0JBQ3RELEVBQUU7Z0JBQ0YsS0FBSztnQkFDTCxtSUFBbUk7YUFDcEksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFDYixDQUFDO0lBQ0wsQ0FBQztDQUFBO0FBdEJELG9FQXNCQztBQUVELFNBQVMsb0JBQW9CLENBQUMsY0FBc0I7SUFDbEQsSUFBSSxjQUFjLEVBQUU7UUFDbEIsT0FBTyx5QkFBeUIsY0FBYyxpQkFBaUIsY0FBYyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLGlCQUFpQixjQUFjLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsdUxBQXVMLENBQUM7S0FDdlU7QUFDSCxDQUFDIn0=