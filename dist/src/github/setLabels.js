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
const getOctokit_1 = require("./getOctokit");
const analysis_1 = require("../analysis");
const common_1 = require("../common");
const perfLabels = ['Perf: Same', 'Perf: Better', 'Perf: Mixed', 'Perf: Worse'];
function isPerfLabel(label) {
    return perfLabels.includes(label.name);
}
function toLabel(change) {
    switch (change) {
        case analysis_1.OverallChange.Same: return perfLabels[0];
        case analysis_1.OverallChange.Better: return perfLabels[1];
        case analysis_1.OverallChange.Mixed: return perfLabels[2];
        case analysis_1.OverallChange.Worse: return perfLabels[3];
    }
}
function setLabels(prNumber, overallChange) {
    return __awaiter(this, void 0, void 0, function* () {
        const octokit = getOctokit_1.getOctokit();
        const labels = yield octokit.issues.listLabelsOnIssue(Object.assign(Object.assign({}, common_1.config.github.commonParams), { issue_number: prNumber }));
        const perfLabels = labels.data.filter(isPerfLabel);
        const newLabel = toLabel(overallChange);
        const labelsToRemove = perfLabels.filter(l => l.name !== newLabel);
        const labelToAdd = perfLabels.some(l => l.name === newLabel) ? undefined : newLabel;
        for (const label of labelsToRemove) {
            yield octokit.issues.removeLabel(Object.assign(Object.assign({}, common_1.config.github.commonParams), { issue_number: prNumber, name: label.name }));
        }
        if (labelToAdd) {
            yield octokit.issues.addLabels(Object.assign(Object.assign({}, common_1.config.github.commonParams), { issue_number: prNumber, labels: [labelToAdd] }));
        }
    });
}
exports.setLabels = setLabels;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0TGFiZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2dpdGh1Yi9zZXRMYWJlbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBMEM7QUFDMUMsMENBQTRDO0FBQzVDLHNDQUFtQztBQUduQyxNQUFNLFVBQVUsR0FBRyxDQUFDLFlBQVksRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBRWhGLFNBQVMsV0FBVyxDQUFDLEtBQWtEO0lBQ3JFLE9BQU8sVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekMsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLE1BQWlDO0lBQ2hELFFBQVEsTUFBTSxFQUFFO1FBQ2QsS0FBSyx3QkFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlDLEtBQUssd0JBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRCxLQUFLLHdCQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0MsS0FBSyx3QkFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2hEO0FBQ0gsQ0FBQztBQUVELFNBQXNCLFNBQVMsQ0FBQyxRQUFnQixFQUFFLGFBQXdDOztRQUN4RixNQUFNLE9BQU8sR0FBRyx1QkFBVSxFQUFFLENBQUM7UUFDN0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixpQ0FDaEQsZUFBTSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEtBQzdCLFlBQVksRUFBRSxRQUFRLElBQ3RCLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNuRCxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDeEMsTUFBTSxjQUFjLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUM7UUFDbkUsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBRXBGLEtBQUssTUFBTSxLQUFLLElBQUksY0FBYyxFQUFFO1lBQ2xDLE1BQU0sT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLGlDQUMzQixlQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksS0FDN0IsWUFBWSxFQUFFLFFBQVEsRUFDdEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLElBQ2hCLENBQUM7U0FDSjtRQUVELElBQUksVUFBVSxFQUFFO1lBQ2QsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsaUNBQ3pCLGVBQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxLQUM3QixZQUFZLEVBQUUsUUFBUSxFQUN0QixNQUFNLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFDcEIsQ0FBQztTQUNKO0lBQ0gsQ0FBQztDQUFBO0FBM0JELDhCQTJCQyJ9