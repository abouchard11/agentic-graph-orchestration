/**
 * Script-held orchestration skeleton.
 * The script owns the loop and intermediate state; agents do the work.
 */

async function runGraph(goal, context) {
  const nodes = {
    plan: {
      dependsOn: [],
      owns: ["PLAN.md"],
      doneWhen: "PLAN.md exists and contains measurable success criteria",
      run: async () => ({ planPath: "PLAN.md" }),
    },
    implement: {
      dependsOn: ["plan"],
      owns: ["src/", "tests/"],
      doneWhen: "targeted tests pass and the diff is reviewable",
      run: async () => ({ diffSummary: "..." }),
    },
    verify: {
      dependsOn: ["implement"],
      owns: [],
      doneWhen: "verifier returns CLEAN_PASS",
      run: async () => {
        const result = await runVerifier();
        if (!result.pass) throw new Error("Verifier failed: " + result.reason);
        return result;
      },
    },
  };

  const state = {};
  const order = ["plan", "implement", "verify"];

  for (const name of order) {
    const node = nodes[name];
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        state[name] = await node.run(state);
        break;
      } catch (e) {
        attempts += 1;
        if (attempts >= maxAttempts) throw e;
      }
    }
  }

  return { final: state.verify, artifacts: state };
}

async function runVerifier() {
  return { pass: true, reason: "ok" };
}

module.exports = { runGraph };
