"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const commentTagStart = '<!-- @dt-perf';
function createPerfCommentBody(body) {
    return [
        commentTagStart + ` -->`,
        ``,
        body,
    ].join('\n');
}
exports.createPerfCommentBody = createPerfCommentBody;
function isPerfComment({ body, user }) {
    return user.login === common_1.config.github.typeScriptBotUsername
        && body.trimLeft().startsWith(commentTagStart);
}
exports.isPerfComment = isPerfComment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvY29tbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHNDQUFtQztBQUVuQyxNQUFNLGVBQWUsR0FBRyxlQUFlLENBQUM7QUFFeEMsU0FBZ0IscUJBQXFCLENBQUMsSUFBWTtJQUNoRCxPQUFPO1FBQ0wsZUFBZSxHQUFHLE1BQU07UUFDeEIsRUFBRTtRQUNGLElBQUk7S0FDTCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNmLENBQUM7QUFORCxzREFNQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQXlEO0lBQ2pHLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxlQUFNLENBQUMsTUFBTSxDQUFDLHFCQUFxQjtXQUNwRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ25ELENBQUM7QUFIRCxzQ0FHQyJ9