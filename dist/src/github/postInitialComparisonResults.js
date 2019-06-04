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
const comment_1 = require("./comment");
function postInitialComparisonResults({ comparisons, dependentCount, dryRun, }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (dryRun) {
            return getFullFirstPostMessage(createTablesWithAnalysesMessage_1.createTablesWithAnalysesMessage(comparisons, parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER || '')), dependentCount);
        }
        else {
            try {
                const prNumber = parseInt(util_1.assertDefined(process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER, `Required environment variable 'SYSTEM_PULLREQUEST_PULLREQUESTNUMBER' was not set.`), 10);
                const octokit = getOctokit_1.getOctokit();
                const comments = yield octokit.issues.listComments(Object.assign({}, common_1.config.github.commonParams, { issue_number: prNumber }));
                const hasPreviousComment = comments.data.some(comment_1.isPerfComment);
                const message = hasPreviousComment
                    ? getConciseUpdateMessage(createTablesWithAnalysesMessage_1.createTablesWithAnalysesMessage(comparisons, prNumber, /*alwaysWriteHeader*/ false, /*alwaysCollapseDetails*/ true), comparisons[0][1].body.sourceVersion)
                    : getFullFirstPostMessage(createTablesWithAnalysesMessage_1.createTablesWithAnalysesMessage(comparisons, prNumber), dependentCount);
                yield octokit.issues.createComment(Object.assign({}, common_1.config.github.commonParams, { issue_number: prNumber, body: comment_1.createPerfCommentBody(message) }));
            }
            catch (err) {
                throw err;
            }
        }
    });
}
exports.postInitialComparisonResults = postInitialComparisonResults;
function getFullFirstPostMessage(mainMessage, dependentCount) {
    return common_1.compact([
        `👋 **Hi there!** I’ve run some quick performance metrics against master and your PR. **This is still an experiment**, so don’t panic if I say something crazy! I’m still learning how to interpret these metrics.`,
        ``,
        getDependentsMessage(dependentCount),
        ``,
        `Let’s review the numbers, shall we?`,
        ``,
        mainMessage,
        ``,
        `---`,
        'If you have any questions or comments about me, you can ping [`@andrewbranch`](https://github.com/andrewbranch). Have a nice day!',
    ]).join('\n');
}
function getConciseUpdateMessage(mainMessage, sha) {
    return [
        `Updated numbers for you here from ${sha.slice(0, 7)}:`,
        ``,
        mainMessage,
    ].join('\n');
}
function getDependentsMessage(dependentCount) {
    if (dependentCount) {
        return `I’m still measuring **${dependentCount} other package${dependentCount === 1 ? '' : 's'}** that depend${dependentCount === 1 ? 's' : ''} on these typings, and will post another comment with those results when I’m done. But in the meantime, you can go ahead and see the results of what you directly changed in this PR.`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdEluaXRpYWxDb21wYXJpc29uUmVzdWx0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvcG9zdEluaXRpYWxDb21wYXJpc29uUmVzdWx0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsc0NBQStFO0FBQy9FLDZDQUEwQztBQUMxQyx3REFBOEQ7QUFDOUQsdUZBQW9GO0FBQ3BGLHVDQUFpRTtBQVVqRSxTQUFzQiw0QkFBNEIsQ0FBQyxFQUNqRCxXQUFXLEVBQ1gsY0FBYyxFQUNkLE1BQU0sR0FDOEI7O1FBRXBDLElBQUksTUFBTSxFQUFFO1lBQ1YsT0FBTyx1QkFBdUIsQ0FDNUIsaUVBQStCLENBQzdCLFdBQVcsRUFDWCxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUNuRSxjQUFjLENBQUMsQ0FBQztTQUNuQjthQUFNO1lBQ0wsSUFBSTtnQkFDRixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsb0JBQWEsQ0FDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsRUFDaEQsbUZBQW1GLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFFNUYsTUFBTSxPQUFPLEdBQUcsdUJBQVUsRUFBRSxDQUFDO2dCQUM3QixNQUFNLFFBQVEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxtQkFDN0MsZUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQzdCLFlBQVksRUFBRSxRQUFRLElBQ3RCLENBQUM7Z0JBRUgsTUFBTSxrQkFBa0IsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBYSxDQUFDLENBQUM7Z0JBQzdELE1BQU0sT0FBTyxHQUFHLGtCQUFrQjtvQkFDaEMsQ0FBQyxDQUFDLHVCQUF1QixDQUN2QixpRUFBK0IsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLHFCQUFxQixDQUFDLEtBQUssRUFBRSx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsRUFDbkgsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7b0JBQ3ZDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxpRUFBK0IsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBRXBHLE1BQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQyxhQUFhLG1CQUM3QixlQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksSUFDN0IsWUFBWSxFQUFFLFFBQVEsRUFDdEIsSUFBSSxFQUFFLCtCQUFxQixDQUFDLE9BQU8sQ0FBQyxJQUNwQyxDQUFDO2FBQ0o7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDWixNQUFNLEdBQUcsQ0FBQzthQUNYO1NBQ0Y7SUFDSCxDQUFDO0NBQUE7QUF4Q0Qsb0VBd0NDO0FBRUQsU0FBUyx1QkFBdUIsQ0FBQyxXQUFtQixFQUFFLGNBQXNCO0lBQzFFLE9BQU8sZ0JBQU8sQ0FBQztRQUNiLG1OQUFtTjtRQUNuTixFQUFFO1FBQ0Ysb0JBQW9CLENBQUMsY0FBYyxDQUFDO1FBQ3BDLEVBQUU7UUFDRixxQ0FBcUM7UUFDckMsRUFBRTtRQUNGLFdBQVc7UUFDWCxFQUFFO1FBQ0YsS0FBSztRQUNMLG1JQUFtSTtLQUNwSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hCLENBQUM7QUFFRCxTQUFTLHVCQUF1QixDQUFDLFdBQW1CLEVBQUUsR0FBVztJQUMvRCxPQUFPO1FBQ0wscUNBQXFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHO1FBQ3ZELEVBQUU7UUFDRixXQUFXO0tBQ1osQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZixDQUFDO0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxjQUFzQjtJQUNsRCxJQUFJLGNBQWMsRUFBRTtRQUNsQixPQUFPLHlCQUF5QixjQUFjLGlCQUFpQixjQUFjLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsaUJBQWlCLGNBQWMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSx1TEFBdUwsQ0FBQztLQUN2VTtBQUNILENBQUMifQ==