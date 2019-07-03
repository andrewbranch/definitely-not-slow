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
const util_1 = require("types-publisher/bin/util/util");
const getOctokit_1 = require("./getOctokit");
const createTablesWithAnalysesMessage_1 = require("./createTablesWithAnalysesMessage");
const comment_1 = require("./comment");
function postDependentsComparisonResult({ comparisons, dryRun, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = common_1.compact([
            `Ok, I’m back! As promised, here are the results from dependent packages`,
            ``,
            createTablesWithAnalysesMessage_1.createTablesWithAnalysesMessage(comparisons, parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER || '')),
            true,
        ]).join('\n');
        if (!dryRun) {
            try {
                const prNumber = parseInt(util_1.assertDefined(process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER, `Required environment variable 'SYSTEM_PULLREQUEST_PULLREQUESTNUMBER' was not set.`), 10);
                const octokit = getOctokit_1.getOctokit();
                yield octokit.issues.createComment(Object.assign({}, common_1.config.github.commonParams, { issue_number: prNumber, body: comment_1.createPerfCommentBody(message) }));
            }
            catch (err) {
                console.log(message);
                throw err;
            }
        }
        return message;
    });
}
exports.postDependentsComparisonResult = postDependentsComparisonResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdERlcGVuZGVudHNDb21wYXJpc29uUmVzdWx0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvcG9zdERlcGVuZGVudHNDb21wYXJpc29uUmVzdWx0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsc0NBQStFO0FBQy9FLHdEQUE4RDtBQUM5RCw2Q0FBMEM7QUFDMUMsdUZBQW9GO0FBQ3BGLHVDQUFrRDtBQVNsRCxTQUFzQiw4QkFBOEIsQ0FBQyxFQUNuRCxXQUFXLEVBQ1gsTUFBTSxHQUNnQzs7UUFDdEMsTUFBTSxPQUFPLEdBQUcsZ0JBQU8sQ0FBQztZQUN0Qix5RUFBeUU7WUFDekUsRUFBRTtZQUNGLGlFQUErQixDQUM3QixXQUFXLEVBQ1gsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLElBQUksRUFBRSxDQUFDLENBQUM7WUFDakUsSUFBSTtTQUNQLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFZCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1gsSUFBSTtnQkFDRixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsb0JBQWEsQ0FDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsRUFDaEQsbUZBQW1GLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFFNUYsTUFBTSxPQUFPLEdBQUcsdUJBQVUsRUFBRSxDQUFDO2dCQUM3QixNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxtQkFDN0IsZUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQzdCLFlBQVksRUFBRSxRQUFRLEVBQ3RCLElBQUksRUFBRSwrQkFBcUIsQ0FBQyxPQUFPLENBQUMsSUFDcEMsQ0FBQzthQUNKO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDckIsTUFBTSxHQUFHLENBQUM7YUFDWDtTQUNGO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztDQUFBO0FBL0JELHdFQStCQyJ9