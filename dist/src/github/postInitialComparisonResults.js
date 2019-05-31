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
function postInitialComparisonResults({ comparisons, dependentCount, dryRun, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = common_1.compact([
            `👋 **Hi there!** I’ve run some quick performance metrics against master and your PR. **This is still an experiment**, so don’t panic if I say something crazy! I’m still learning how to interpret these metrics.`,
            ``,
            getDependentsMessage(dependentCount),
            ``,
            `Let’s review the numbers, shall we?`,
            ``,
            createTablesWithAnalysesMessage_1.createTablesWithAnalysesMessage(comparisons, parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER || '')),
            ``,
            `---`,
            'If you have any questions or comments about me, you can ping [`@andrewbranch`](https://github.com/andrewbranch). Have a nice day!',
        ]).join('\n');
        if (!dryRun) {
            try {
                const prNumber = parseInt(util_1.assertDefined(process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER, `Required environment variable 'SYSTEM_PULLREQUEST_PULLREQUESTNUMBER' was not set.`), 10);
                const octokit = getOctokit_1.getOctokit();
                yield octokit.issues.createComment(Object.assign({}, common_1.config.github.commonParams, { issue_number: prNumber, body: message }));
            }
            catch (err) {
                console.log(message);
                throw err;
            }
        }
        return message;
    });
}
exports.postInitialComparisonResults = postInitialComparisonResults;
function getDependentsMessage(dependentCount) {
    if (dependentCount) {
        return `I’m still measuring **${dependentCount} other package${dependentCount === 1 ? '' : 's'}** that depend${dependentCount === 1 ? 's' : ''} on these typings, and will post another comment with those results when I’m done. But in the meantime, you can go ahead and see the results of what you directly changed in this PR.`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdEluaXRpYWxDb21wYXJpc29uUmVzdWx0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvcG9zdEluaXRpYWxDb21wYXJpc29uUmVzdWx0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsc0NBQStFO0FBQy9FLDZDQUEwQztBQUMxQyx3REFBOEQ7QUFDOUQsdUZBQW9GO0FBVXBGLFNBQXNCLDRCQUE0QixDQUFDLEVBQ2pELFdBQVcsRUFDWCxjQUFjLEVBQ2QsTUFBTSxHQUM4Qjs7UUFDcEMsTUFBTSxPQUFPLEdBQUcsZ0JBQU8sQ0FBQztZQUN0QixtTkFBbU47WUFDbk4sRUFBRTtZQUNGLG9CQUFvQixDQUFDLGNBQWMsQ0FBQztZQUNwQyxFQUFFO1lBQ0YscUNBQXFDO1lBQ3JDLEVBQUU7WUFDRixpRUFBK0IsQ0FDN0IsV0FBVyxFQUNYLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ25FLEVBQUU7WUFDRixLQUFLO1lBQ0wsbUlBQW1JO1NBQ3BJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFZCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1gsSUFBSTtnQkFDRixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsb0JBQWEsQ0FDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsRUFDaEQsbUZBQW1GLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFFNUYsTUFBTSxPQUFPLEdBQUcsdUJBQVUsRUFBRSxDQUFDO2dCQUM3QixNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxtQkFDN0IsZUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQzdCLFlBQVksRUFBRSxRQUFRLEVBQ3RCLElBQUksRUFBRSxPQUFPLElBQ2IsQ0FBQzthQUNKO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDckIsTUFBTSxHQUFHLENBQUM7YUFDWDtTQUNGO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztDQUFBO0FBdENELG9FQXNDQztBQUVELFNBQVMsb0JBQW9CLENBQUMsY0FBc0I7SUFDbEQsSUFBSSxjQUFjLEVBQUU7UUFDbEIsT0FBTyx5QkFBeUIsY0FBYyxpQkFBaUIsY0FBYyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLGlCQUFpQixjQUFjLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsdUxBQXVMLENBQUM7S0FDdlU7QUFDSCxDQUFDIn0=