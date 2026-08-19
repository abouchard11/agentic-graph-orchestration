const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const { lintGraph, loadAndLint } = require("./lint-graph.js");

const examples = path.join(__dirname, "..", "examples");

test("dozen graph passes", () => {
  assert.deepEqual(loadAndLint(path.join(examples, "dozen-graph.json")), []);
});

test("coding loop passes", () => {
  assert.deepEqual(loadAndLint(path.join(examples, "coding-loop.json")), []);
});

test("model cannot close accept", () => {
  const errors = lintGraph({
    name: "cheat",
    goal: "Finish the demo in one handler.",
    stop: { maxUsd: 1 },
    nodes: [
      {
        id: "accept",
        dependsOn: [],
        owns: ["slots"],
        closer: "model",
        irreversible: true,
        doneWhen: "auto-marked passed",
      },
    ],
  });
  assert.ok(errors.some((e) => /irreversible/.test(e)));
});

test("missing verifier fails", () => {
  const errors = lintGraph({
    name: "thin",
    goal: "Do something vaguely useful.",
    stop: { maxUsd: 1 },
    nodes: [{ id: "draft", dependsOn: [], owns: [], closer: "model", doneWhen: "" }],
  });
  assert.ok(errors.some((e) => /doneWhen/.test(e)));
});

test("inner loop cannot restart intake", () => {
  const errors = lintGraph({
    name: "restart",
    goal: "Retry the whole swarm because a caption failed.",
    stop: { noProgressSteps: 2 },
    nodes: [
      { id: "intake", dependsOn: [], owns: [], closer: "script", doneWhen: "brief parsed" },
      { id: "draft", dependsOn: ["intake"], owns: [], closer: "model", doneWhen: "caption exists" },
    ],
    loops: [{ id: "inner", nodes: ["draft"], maxAttempts: 2, restarts: ["intake"] }],
  });
  assert.ok(errors.some((e) => /must not restart/.test(e)));
});
