# SLA Watchdog

Open questions stall tasks. Whenever a question is opened on a task, this
plugin posts an escalation comment that quotes the question summary, asks the
team to answer, and links back to the task.

## Hook registered

- `task.question_opened` → `taskQuestionOpened(event)` via the exported
  `hooks` map.

## Grants requested

- `comment-task` — the plugin's only operation is posting the escalation
  comment. It never edits the task, so it does not need `edit-task`.

## Behaviour

- Returns at most one `comment` operation per event.
- Quotes the `summary` field as a markdown block quote (multi-line summaries
  are quoted line by line) and includes `taskUrl`, `questionSessionId` and
  `occurredAtUtc` when present.
- If the summary is missing the escalation still goes out with whatever
  context is available; only an event with no title, no summary and no URL is
  treated as a no-op (`[]`), and malformed events never throw.
- The comment is capped at the 10 000 character platform limit.

## Example

Event:

```json
{
  "hook": "task.question_opened",
  "taskTitle": "Checkout totals wrong",
  "summary": "Should tax be included in the displayed total?",
  "taskUrl": "https://example.test/tasks/9",
  "questionSessionId": "qs-1"
}
```

Operations returned:

```json
[
  {
    "type": "comment",
    "value": "### Question needs an answer\nA question was opened on **Checkout totals wrong** and is waiting for the team.\n\n> Should tax be included in the displayed total?\n\nPlease answer this question so the task can keep moving.\nTask: https://example.test/tasks/9\nQuestion session: qs-1"
  }
]
```

## Install

Install from the Camillia marketplace (or upload the files listed in
`extension.json`: `plugin.json`, `index.js`, `package.json`) and enable the plugin
for your workspace. Requires Node.js 22 or newer to run the tests with
`npm test`.
