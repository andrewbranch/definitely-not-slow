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
const getOctokit_1 = require("./getOctokit");
const util_1 = require("types-publisher/bin/util/util");
const createTablesWithAnalysesMessage_1 = require("./createTablesWithAnalysesMessage");
const comment_1 = require("./comment");
const analysis_1 = require("../analysis");
const setLabels_1 = require("./setLabels");
function postInitialComparisonResults({ comparisons, dependentCount, dryRun, }) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (dryRun) {
            return getFullFirstPostMessage(createTablesWithAnalysesMessage_1.createTablesWithAnalysesMessage(comparisons, parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER || '')), dependentCount);
        }
        else {
            try {
                const prNumber = parseInt(util_1.assertDefined(process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER, `Required environment variable 'SYSTEM_PULLREQUEST_PULLREQUESTNUMBER' was not set.`), 10);
                const octokit = getOctokit_1.getOctokit();
                const comments = yield octokit.issues.listComments(Object.assign(Object.assign({}, common_1.config.github.commonParams), { issue_number: prNumber }));
                const currentOverallChange = analysis_1.getOverallChangeForComparisons(comparisons);
                const mostRecentComment = common_1.findLast(comments.data, comment_1.isPerfComment);
                if (mostRecentComment) {
                    const lastOverallChange = (_a = comment_1.getCommentData(mostRecentComment)) === null || _a === void 0 ? void 0 : _a.overallChange;
                    if (currentOverallChange === lastOverallChange && !(currentOverallChange & analysis_1.OverallChange.Worse)) {
                        // Everything is fine and nothing has changed, just chill
                        return;
                    }
                    const message = getConciseUpdateMessage(lastOverallChange, currentOverallChange, createTablesWithAnalysesMessage_1.createTablesWithAnalysesMessage(comparisons, prNumber, /*alwaysWriteHeader*/ false, /*alwaysCollapseDetails*/ true), comparisons[0][1].body.sourceVersion);
                    yield octokit.issues.createComment(Object.assign(Object.assign({}, common_1.config.github.commonParams), { issue_number: prNumber, body: comment_1.createPerfCommentBody({ overallChange: currentOverallChange }, message) }));
                }
                else {
                    const message = getFullFirstPostMessage(createTablesWithAnalysesMessage_1.createTablesWithAnalysesMessage(comparisons, prNumber), dependentCount);
                    yield octokit.issues.createComment(Object.assign(Object.assign({}, common_1.config.github.commonParams), { issue_number: prNumber, body: comment_1.createPerfCommentBody({ overallChange: currentOverallChange }, message) }));
                }
                yield setLabels_1.setLabels(prNumber, currentOverallChange);
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
        `👋 **Hi there!** I’ve run some quick measurements against master and your PR. These metrics should help the humans reviewing this PR gauge whether it might negatively affect compile times or editor responsiveness for users who install these typings.`,
        ``,
        getDependentsMessage(dependentCount),
        ``,
        `Let’s review the numbers, shall we?`,
        ``,
        mainMessage
    ]).join('\n');
}
function getConciseUpdateMessage(prevOverallChange, overallChange, mainMessage, sha) {
    const gotBetter = ((prevOverallChange !== null && prevOverallChange !== void 0 ? prevOverallChange : 0)) & analysis_1.OverallChange.Worse && !(((overallChange !== null && overallChange !== void 0 ? overallChange : 0)) & analysis_1.OverallChange.Worse);
    return [
        `Updated numbers for you here from ${sha.slice(0, 7)}. ${gotBetter ? 'Nice job, these numbers look better.' : ''}`,
        ``,
        mainMessage,
    ].join('\n');
}
function getDependentsMessage(dependentCount) {
    if (dependentCount) {
        return `I’m still measuring **${dependentCount} other package${dependentCount === 1 ? '' : 's'}** that depend${dependentCount === 1 ? 's' : ''} on these typings, and will post another comment with those results when I’m done. But in the meantime, you can go ahead and see the results of what you directly changed in this PR.`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdEluaXRpYWxDb21wYXJpc29uUmVzdWx0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvcG9zdEluaXRpYWxDb21wYXJpc29uUmVzdWx0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUF5RjtBQUN6Riw2Q0FBMEM7QUFDMUMsd0RBQThEO0FBQzlELHVGQUFvRjtBQUNwRix1Q0FBaUY7QUFDakYsMENBQTRFO0FBQzVFLDJDQUF3QztBQVV4QyxTQUFzQiw0QkFBNEIsQ0FBQyxFQUNqRCxXQUFXLEVBQ1gsY0FBYyxFQUNkLE1BQU0sR0FDOEI7OztRQUVwQyxJQUFJLE1BQU0sRUFBRTtZQUNWLE9BQU8sdUJBQXVCLENBQzVCLGlFQUErQixDQUM3QixXQUFXLEVBQ1gsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLElBQUksRUFBRSxDQUFDLENBQUMsRUFDbkUsY0FBYyxDQUFDLENBQUM7U0FDbkI7YUFBTTtZQUNMLElBQUk7Z0JBQ0YsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLG9CQUFhLENBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEVBQ2hELG1GQUFtRixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRTVGLE1BQU0sT0FBTyxHQUFHLHVCQUFVLEVBQUUsQ0FBQztnQkFDN0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLFlBQVksaUNBQzdDLGVBQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxLQUM3QixZQUFZLEVBQUUsUUFBUSxJQUN0QixDQUFDO2dCQUVILE1BQU0sb0JBQW9CLEdBQUcseUNBQThCLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3pFLE1BQU0saUJBQWlCLEdBQUcsaUJBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLHVCQUFhLENBQUMsQ0FBQztnQkFDakUsSUFBSSxpQkFBaUIsRUFBRTtvQkFDckIsTUFBTSxpQkFBaUIsU0FBRyx3QkFBYyxDQUFDLGlCQUFpQixDQUFDLDBDQUFFLGFBQWEsQ0FBQztvQkFFM0UsSUFBSSxvQkFBb0IsS0FBSyxpQkFBaUIsSUFBSSxDQUFDLENBQUMsb0JBQW9CLEdBQUcsd0JBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRTt3QkFDL0YseURBQXlEO3dCQUN6RCxPQUFPO3FCQUNSO29CQUVELE1BQU0sT0FBTyxHQUFHLHVCQUF1QixDQUNyQyxpQkFBaUIsRUFDakIsb0JBQW9CLEVBQ3BCLGlFQUErQixDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUscUJBQXFCLENBQUMsS0FBSyxFQUFFLHlCQUF5QixDQUFDLElBQUksQ0FBQyxFQUNuSCxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUV4QyxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxpQ0FDN0IsZUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEtBQzdCLFlBQVksRUFBRSxRQUFRLEVBQ3RCLElBQUksRUFBRSwrQkFBcUIsQ0FBQyxFQUFFLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSxFQUFFLE9BQU8sQ0FBQyxJQUM3RSxDQUFDO2lCQUNKO3FCQUFNO29CQUNMLE1BQU0sT0FBTyxHQUFHLHVCQUF1QixDQUFDLGlFQUErQixDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDaEgsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsaUNBQzdCLGVBQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxLQUM3QixZQUFZLEVBQUUsUUFBUSxFQUN0QixJQUFJLEVBQUUsK0JBQXFCLENBQUMsRUFBRSxhQUFhLEVBQUUsb0JBQW9CLEVBQUUsRUFBRSxPQUFPLENBQUMsSUFDN0UsQ0FBQztpQkFDSjtnQkFFRCxNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLG9CQUFvQixDQUFDLENBQUM7YUFDakQ7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDWixNQUFNLEdBQUcsQ0FBQzthQUNYO1NBQ0Y7O0NBQ0Y7QUEzREQsb0VBMkRDO0FBRUQsU0FBUyx1QkFBdUIsQ0FBQyxXQUFtQixFQUFFLGNBQXNCO0lBQzFFLE9BQU8sZ0JBQU8sQ0FBQztRQUNiLDJQQUEyUDtRQUMzUCxFQUFFO1FBQ0Ysb0JBQW9CLENBQUMsY0FBYyxDQUFDO1FBQ3BDLEVBQUU7UUFDRixxQ0FBcUM7UUFDckMsRUFBRTtRQUNGLFdBQVc7S0FDWixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hCLENBQUM7QUFFRCxTQUFTLHVCQUF1QixDQUM5QixpQkFBNEMsRUFDNUMsYUFBNEIsRUFDNUIsV0FBbUIsRUFDbkIsR0FBVztJQUVYLE1BQU0sU0FBUyxHQUFHLEVBQUMsaUJBQWlCLGFBQWpCLGlCQUFpQixjQUFqQixpQkFBaUIsR0FBSSxDQUFDLEVBQUMsR0FBRyx3QkFBYSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBQyxhQUFhLGFBQWIsYUFBYSxjQUFiLGFBQWEsR0FBSSxDQUFDLEVBQUMsR0FBRyx3QkFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2xILE9BQU87UUFDTCxxQ0FBcUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQ2xILEVBQUU7UUFDRixXQUFXO0tBQ1osQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZixDQUFDO0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxjQUFzQjtJQUNsRCxJQUFJLGNBQWMsRUFBRTtRQUNsQixPQUFPLHlCQUF5QixjQUFjLGlCQUFpQixjQUFjLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsaUJBQWlCLGNBQWMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSx1TEFBdUwsQ0FBQztLQUN2VTtBQUNILENBQUMifQ==