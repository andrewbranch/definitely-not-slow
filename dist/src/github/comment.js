"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../common");
const commentTagStart = '<!-- @dt-perf ';
const commentTagEnd = ' -->';
function assertCommentSafe(str) {
    if (str.includes('-->')) {
        throw new Error('Data is unsafe to serialize in HTML comment');
    }
    return str;
}
function createPerfCommentBody(data, body) {
    return [
        commentTagStart + assertCommentSafe(JSON.stringify({ version: 1, data })) + commentTagEnd,
        '',
        body,
    ].join('\n');
}
exports.createPerfCommentBody = createPerfCommentBody;
function isPerfComment({ body, user }) {
    return user.login === common_1.config.github.typeScriptBotUsername
        && body.trimLeft().startsWith(commentTagStart);
}
exports.isPerfComment = isPerfComment;
function getCommentData(comment) {
    if (isPerfComment(comment)) {
        try {
            const trimmed = comment.body.trimLeft();
            const dataText = trimmed
                .substring(commentTagStart.length)
                .substring(0, trimmed.length - commentTagStart.length - commentTagEnd.length);
            return JSON.parse(dataText);
        }
        catch (_a) {
            return undefined;
        }
    }
}
exports.getCommentData = getCommentData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9naXRodWIvY29tbWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHNDQUFtQztBQUduQyxNQUFNLGVBQWUsR0FBRyxnQkFBZ0IsQ0FBQztBQUN6QyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUM7QUFFN0IsU0FBUyxpQkFBaUIsQ0FBQyxHQUFXO0lBQ3BDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7S0FDaEU7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFNRCxTQUFnQixxQkFBcUIsQ0FBQyxJQUFpQixFQUFFLElBQVk7SUFDbkUsT0FBTztRQUNMLGVBQWUsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsYUFBYTtRQUN6RixFQUFFO1FBQ0YsSUFBSTtLQUNMLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2YsQ0FBQztBQU5ELHNEQU1DO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBeUQ7SUFDakcsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLGVBQU0sQ0FBQyxNQUFNLENBQUMscUJBQXFCO1dBQ3BELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDbkQsQ0FBQztBQUhELHNDQUdDO0FBRUQsU0FBZ0IsY0FBYyxDQUFDLE9BQThEO0lBQzNGLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQzFCLElBQUk7WUFDRixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sUUFBUSxHQUFHLE9BQU87aUJBQ3JCLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDO2lCQUNqQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsZUFBZSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEYsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzdCO1FBQUMsV0FBTTtZQUNOLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO0tBQ0Y7QUFDSCxDQUFDO0FBWkQsd0NBWUMifQ==