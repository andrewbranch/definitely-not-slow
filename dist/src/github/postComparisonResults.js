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
const metrics_1 = require("./metrics");
const createTable_1 = require("./createTable");
function postComparisonResults(a, b) {
    return __awaiter(this, void 0, void 0, function* () {
        const prNumber = parseInt(util_1.assertDefined(process.env.SYSTEM_PULLREQUEST_PULLREQUESTNUMBER, `Required environment variable 'SYSTEM_PULLREQUEST_PULLREQUESTNUMBER' was not set.`), 10);
        const octokit = getOctokit_1.getOctokit();
        octokit.issues.createComment(Object.assign({}, common_1.config.github.commonParams, { issue_number: prNumber, body: common_1.compact([
                `👋 **Hi there!** I’ve run some quick performance metrics against master and your PR. **This is still an experiment**, so don’t panic if I say something crazy! I’m still learning how to interpret these metrics. 😄`,
                ``,
                `Let’s review the numbers, shall we?`,
                ``,
                createTable_1.createTable(a, b, prNumber),
                ``,
                getSystemMismatchMessage(a, b),
                ``,
                getInterestingMetricsMessage(a, b),
                ``,
                'If you have any questions or comments about me, you can ping [`@andrewbranch`](https://github.com/andrewbranch). Have a nice day!'
            ]).join('\n') }));
    });
}
exports.postComparisonResults = postComparisonResults;
function getSystemMismatchMessage(a, b) {
    return !common_1.systemsAreCloseEnough(a.system, b.system)
        ? `First off, note that the system varied slightly between these two runs, so you’ll have to take these measurements with a grain of salt.`
        : undefined;
}
function getInterestingMetricsMessage(a, b) {
    const interestingMetrics = getInterestingMetrics(a, b);
    if (!interestingMetrics.length) {
        return `It looks like nothing changed _too_ much. I’m pretty lenient since I’m still an experiment, so take a look anyways and make sure nothing looks out of place.`;
    }
    if (interestingMetrics.every(({ isGood }) => isGood)) {
        return `Wow, it looks like all the big movers moved in the right direction! Way to go! 🌟`;
    }
    if (interestingMetrics.length > 3 && interestingMetrics.filter(({ isGood }) => isGood).length / interestingMetrics.length < 0.5) {
        return `It looks like there are several metrics that changed quite a bit. You might want to take a look and make sure your changes won’t cause painful slow-downs for users consuming these types.`;
    }
    return `Looks like there were a couple significant differences. You might want to take a look and make sure your changes won’t cause painful slow-downs for users consuming these types.`;
}
function getInterestingMetrics(a, b) {
    return Object.values(metrics_1.metrics).reduce((acc, metric) => {
        if (metric.isUninteresting) {
            return acc;
        }
        const aValue = metric.getValue(a);
        const bValue = metric.getValue(b);
        const percentDiff = isNumber(aValue) && isNumber(bValue) && common_1.getPercentDiff(aValue, bValue);
        const comparisonValue = percentDiff && metric.higherIsBetter ? percentDiff * -1 : percentDiff;
        const isGood = comparisonValue < common_1.config.comparison.percentDiffGoldStarThreshold;
        if (percentDiff && comparisonValue && (comparisonValue > common_1.config.comparison.percentDiffWarningThreshold || isGood)) {
            return [
                ...acc,
                { metric, percentDiff, isGood },
            ];
        }
        return acc;
    }, []);
}
function isNumber(n) {
    return typeof n === 'number' && !isNaN(n);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdENvbXBhcmlzb25SZXN1bHRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dpdGh1Yi9wb3N0Q29tcGFyaXNvblJlc3VsdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHNDQUFzSDtBQUN0SCw2Q0FBMEM7QUFDMUMsd0RBQThEO0FBQzlELHVDQUE0QztBQUM1QywrQ0FBNEM7QUFFNUMsU0FBc0IscUJBQXFCLENBQUMsQ0FBb0MsRUFBRSxDQUFvQzs7UUFDcEgsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLG9CQUFhLENBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEVBQ2hELG1GQUFtRixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFNUYsTUFBTSxPQUFPLEdBQUcsdUJBQVUsRUFBRSxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxtQkFDdkIsZUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQzdCLFlBQVksRUFBRSxRQUFRLEVBQ3RCLElBQUksRUFBRSxnQkFBTyxDQUFDO2dCQUNaLHNOQUFzTjtnQkFDdE4sRUFBRTtnQkFDRixxQ0FBcUM7Z0JBQ3JDLEVBQUU7Z0JBQ0YseUJBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQztnQkFDM0IsRUFBRTtnQkFDRix3QkFBd0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM5QixFQUFFO2dCQUNGLDRCQUE0QixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2xDLEVBQUU7Z0JBQ0YsbUlBQW1JO2FBQ3BJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQ2IsQ0FBQztJQUNMLENBQUM7Q0FBQTtBQXZCRCxzREF1QkM7QUFFRCxTQUFTLHdCQUF3QixDQUFDLENBQW9DLEVBQUUsQ0FBb0M7SUFDMUcsT0FBTyxDQUFDLDhCQUFxQixDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUMvQyxDQUFDLENBQUMseUlBQXlJO1FBQzNJLENBQUMsQ0FBQyxTQUFTLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQVMsNEJBQTRCLENBQUMsQ0FBb0MsRUFBRSxDQUFvQztJQUM5RyxNQUFNLGtCQUFrQixHQUFHLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFO1FBQzlCLE9BQU8sOEpBQThKLENBQUM7S0FDdks7SUFDRCxJQUFJLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ3BELE9BQU8sbUZBQW1GLENBQUM7S0FDNUY7SUFDRCxJQUFJLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sR0FBRyxHQUFHLEVBQUU7UUFDL0gsT0FBTyw0TEFBNEwsQ0FBQztLQUNyTTtJQUNELE9BQU8sa0xBQWtMLENBQUM7QUFDNUwsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsQ0FBb0MsRUFBRSxDQUFvQztJQUN2RyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsaUJBQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQStELEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDL0csSUFBSSxNQUFNLENBQUMsZUFBZSxFQUFFO1lBQzFCLE9BQU8sR0FBRyxDQUFDO1NBQ1o7UUFDRCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSx1QkFBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMzRixNQUFNLGVBQWUsR0FBRyxXQUFXLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7UUFDOUYsTUFBTSxNQUFNLEdBQUcsZUFBZSxHQUFHLGVBQU0sQ0FBQyxVQUFVLENBQUMsNEJBQTRCLENBQUM7UUFDaEYsSUFBSSxXQUFXLElBQUksZUFBZSxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQU0sQ0FBQyxVQUFVLENBQUMsMkJBQTJCLElBQUksTUFBTSxDQUFDLEVBQUU7WUFDakgsT0FBTztnQkFDTCxHQUFHLEdBQUc7Z0JBQ04sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRTthQUNoQyxDQUFDO1NBQ0g7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNULENBQUM7QUFFRCxTQUFTLFFBQVEsQ0FBQyxDQUFNO0lBQ3RCLE9BQU8sT0FBTyxDQUFDLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVDLENBQUMifQ==