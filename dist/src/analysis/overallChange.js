"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metrics_1 = require("./metrics");
const util_1 = require("types-publisher/bin/util/util");
var OverallChange;
(function (OverallChange) {
    OverallChange[OverallChange["Same"] = 0] = "Same";
    OverallChange[OverallChange["Worse"] = 1] = "Worse";
    OverallChange[OverallChange["Better"] = 2] = "Better";
    OverallChange[OverallChange["Mixed"] = 3] = "Mixed";
})(OverallChange = exports.OverallChange || (exports.OverallChange = {}));
function getOverallChangeForSingleComparison(before, after) {
    let change = OverallChange.Same;
    for (const { significance } of metrics_1.getInterestingMetrics(before, after)) {
        switch (significance) {
            case "alert" /* Alert */:
            case "warning" /* Warning */:
                change |= OverallChange.Worse;
                break;
            case "awesome" /* Awesome */:
                change |= OverallChange.Better;
                break;
            default:
                util_1.assertNever(significance);
        }
    }
    return change;
}
exports.getOverallChangeForSingleComparison = getOverallChangeForSingleComparison;
function getOverallChangeForComparisons(comparisons) {
    let change = OverallChange.Same;
    for (const comparison of comparisons) {
        change |= comparison[0] ? getOverallChangeForSingleComparison(comparison[0], comparison[1]) : OverallChange.Same;
    }
    return change;
}
exports.getOverallChangeForComparisons = getOverallChangeForComparisons;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmFsbENoYW5nZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hbmFseXNpcy9vdmVyYWxsQ2hhbmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsdUNBQXFFO0FBQ3JFLHdEQUE0RDtBQUk1RCxJQUFZLGFBS1g7QUFMRCxXQUFZLGFBQWE7SUFDdkIsaURBQVEsQ0FBQTtJQUNSLG1EQUFjLENBQUE7SUFDZCxxREFBZSxDQUFBO0lBQ2YsbURBQXNCLENBQUE7QUFDeEIsQ0FBQyxFQUxXLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBS3hCO0FBRUQsU0FBZ0IsbUNBQW1DLENBQUMsTUFBeUMsRUFBRSxLQUF3QztJQUNySSxJQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDO0lBQ2hDLEtBQUssTUFBTSxFQUFFLFlBQVksRUFBRSxJQUFJLCtCQUFxQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsRUFBRTtRQUNuRSxRQUFRLFlBQVksRUFBRTtZQUNwQix5QkFBNkI7WUFDN0I7Z0JBQ0UsTUFBTSxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUM7Z0JBQzlCLE1BQU07WUFDUjtnQkFDRSxNQUFNLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQztnQkFDL0IsTUFBTTtZQUNSO2dCQUNFLGtCQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDN0I7S0FDRjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFoQkQsa0ZBZ0JDO0FBRUQsU0FBZ0IsOEJBQThCLENBQUMsV0FBNkI7SUFDMUUsSUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQztJQUNoQyxLQUFLLE1BQU0sVUFBVSxJQUFJLFdBQVcsRUFBRTtRQUNwQyxNQUFNLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxtQ0FBbUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7S0FDbEg7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBTkQsd0VBTUMifQ==