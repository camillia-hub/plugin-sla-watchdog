// plugin-sla-watchdog
// Escalates open task questions with a comment so the team answers quickly.
// Grant requested: comment-task (the plugin only ever returns comment operations).

const MAX_COMMENT_LENGTH = 10000;

function asString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

function quoteBlock(text) {
  return "> " + text.split("\n").join("\n> ");
}

export function buildEscalation(event) {
  if (!event || typeof event !== "object") return "";
  const title = asString(event.taskTitle);
  const summary = asString(event.summary);
  const url = asString(event.taskUrl);
  const sessionId = asString(event.questionSessionId);
  const occurredAt = asString(event.occurredAtUtc);
  if (!title && !summary && !url) return "";
  const lines = [];
  lines.push("### Question needs an answer");
  if (title) {
    lines.push("A question was opened on **" + title + "** and is waiting for the team.");
  } else {
    lines.push("A question was opened on a task and is waiting for the team.");
  }
  if (summary) {
    lines.push("");
    lines.push(quoteBlock(summary));
  }
  lines.push("");
  lines.push("Please answer this question so the task can keep moving.");
  if (url) lines.push("Task: " + url);
  if (sessionId) lines.push("Question session: " + sessionId);
  if (occurredAt) lines.push("Opened at (UTC): " + occurredAt);
  let text = lines.join("\n");
  if (text.length > MAX_COMMENT_LENGTH) {
    text = text.slice(0, MAX_COMMENT_LENGTH - 3) + "...";
  }
  return text;
}

export async function taskQuestionOpened(event) {
  const text = buildEscalation(event);
  if (!text) return [];
  return [{ type: "comment", value: text }];
}

export const hooks = {
  "task.question_opened": taskQuestionOpened,
};
