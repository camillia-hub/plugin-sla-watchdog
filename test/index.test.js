import test from "node:test";
import assert from "node:assert/strict";
import { buildEscalation, hooks, taskQuestionOpened } from "../index.js";

test("hooks map registers task.question_opened", () => {
  assert.deepEqual(Object.keys(hooks), ["task.question_opened"]);
  assert.equal(typeof hooks["task.question_opened"], "function");
});

test("escalates with quoted summary and task url", async () => {
  const ops = await taskQuestionOpened({
    hook: "task.question_opened",
    taskTitle: "Checkout totals wrong",
    summary: "Should tax be included in the displayed total?",
    taskUrl: "https://example.test/tasks/9",
    questionSessionId: "qs-1",
    occurredAtUtc: "2026-10-23T09:00:00Z",
  });
  assert.equal(ops.length, 1);
  assert.equal(ops[0].type, "comment");
  assert.ok(ops[0].value.includes("> Should tax be included in the displayed total?"));
  assert.ok(ops[0].value.includes("https://example.test/tasks/9"));
  assert.ok(ops[0].value.includes("qs-1"));
  assert.match(ops[0].value, /please answer/i);
});

test("multi-line summaries are quoted line by line", async () => {
  const ops = await taskQuestionOpened({ taskTitle: "T", summary: "line one\nline two" });
  assert.equal(ops.length, 1);
  assert.ok(ops[0].value.includes("> line one\n> line two"));
});

test("still escalates when optional fields are missing", async () => {
  const ops = await taskQuestionOpened({ taskUrl: "https://example.test/tasks/9" });
  assert.equal(ops.length, 1);
  assert.ok(ops[0].value.includes("https://example.test/tasks/9"));
  assert.ok(!ops[0].value.includes(">"));
});

test("no-ops when nothing identifiable is present", async () => {
  assert.deepEqual(await taskQuestionOpened({}), []);
  assert.deepEqual(await taskQuestionOpened({ hook: "task.question_opened" }), []);
});

test("never throws on missing or malformed events", async () => {
  assert.deepEqual(await taskQuestionOpened(undefined), []);
  assert.deepEqual(await taskQuestionOpened(null), []);
  assert.deepEqual(await taskQuestionOpened(42), []);
  assert.equal(buildEscalation(undefined), "");
});

test("comment stays within the length limit", async () => {
  const ops = await taskQuestionOpened({ taskTitle: "T", summary: "y".repeat(50000) });
  assert.equal(ops.length, 1);
  assert.ok(ops[0].value.length <= 10000);
});
