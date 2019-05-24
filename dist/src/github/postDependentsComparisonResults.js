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
function postDependentsComparisonResult({ comparisons, dryRun, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = common_1.compact([
            `Ok, I’m back! As promised, here are the results from dependent packages`,
            ``,
            createTablesWithAnalysesMessage_1.createTablesWithAnalysesMessage(comparisons, parseInt(process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER || '')),
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
exports.postDependentsComparisonResult = postDependentsComparisonResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdERlcGVuZGVudHNDb21wYXJpc29uUmVzdWx0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvcG9zdERlcGVuZGVudHNDb21wYXJpc29uUmVzdWx0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsc0NBQStFO0FBQy9FLHdEQUE4RDtBQUM5RCw2Q0FBMEM7QUFDMUMsdUZBQW9GO0FBU3BGLFNBQXNCLDhCQUE4QixDQUFDLEVBQ25ELFdBQVcsRUFDWCxNQUFNLEdBQ2dDOztRQUN0QyxNQUFNLE9BQU8sR0FBRyxnQkFBTyxDQUFDO1lBQ3RCLHlFQUF5RTtZQUN6RSxFQUFFO1lBQ0YsaUVBQStCLENBQzdCLFdBQVcsRUFDWCxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNwRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWQsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNYLElBQUk7Z0JBQ0YsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLG9CQUFhLENBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEVBQ2hELG1GQUFtRixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBRTVGLE1BQU0sT0FBTyxHQUFHLHVCQUFVLEVBQUUsQ0FBQztnQkFDN0IsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsbUJBQzdCLGVBQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxJQUM3QixZQUFZLEVBQUUsUUFBUSxFQUN0QixJQUFJLEVBQUUsT0FBTyxJQUNiLENBQUM7YUFDSjtZQUFDLE9BQU8sR0FBRyxFQUFFO2dCQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3JCLE1BQU0sR0FBRyxDQUFDO2FBQ1g7U0FDRjtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7Q0FBQTtBQTlCRCx3RUE4QkMifQ==