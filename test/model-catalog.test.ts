import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import type { Adapter, AdapterRunContext, AdapterRunResult } from "../src/adapters/types.js";
import type { RouteDescriptor } from "../src/contract.js";

import { ClaudeAdapter } from "../src/adapters/claude.js";
import { FakeAdapter } from "../src/adapters/fake.js";
import { AdapterRegistry } from "../src/adapters/registry.js";
import { applyUserModelCatalog } from "../src/model-catalog.js";

class CountingAdapter implements Adapter {
  readonly id = "counting";
  calls = 0;

  async discover(): Promise<readonly RouteDescriptor[]> {
    this.calls += 1;
    return [
      {
        routeId: "counting:test",
        provider: "counting",
        model: "test",
        efforts: ["low"],
        via: "counting",
        adapter: this.id,
        harnessVersion: "1.0.0",
        authenticationMode: "none",
        capabilities: [],
        interactionStrategies: ["deny"],
        assurance: "none",
        runtimeIdentityEvidence: "verified",
        readiness: "ready",
        qualification: [],
        diagnostics: [],
      },
    ];
  }

  async run(_context: AdapterRunContext): Promise<AdapterRunResult> {
    throw new Error("Not used in discovery cache test.");
  }
}

test("user model catalog adds aliases and canonical native model mappings", async () => {
  const root = await mkdtemp(join(tmpdir(), "harness-relay-catalog-"));
  const catalogPath = join(root, "config.json");
  await writeFile(
    catalogPath,
    JSON.stringify({
      adapters: {
        fake: {
          aliases: { quick: "fake-echo" },
          models: {
            local: {
              nativeModel: "fake-echo",
              efforts: ["low"],
            },
          },
        },
      },
    }),
    "utf8",
  );
  try {
    const registry = new AdapterRegistry([new FakeAdapter()], { catalogPath });
    const routes = await registry.discover();
    const alias = routes.find((route) => route.model === "quick");
    const custom = routes.find((route) => route.model === "local");
    assert.equal(alias?.canonicalModel, "fake-echo");
    assert.equal(alias?.nativeModel, "fake-echo");
    assert.equal(alias?.qualification.at(-1)?.qualificationId, "user-declared:fake:quick");
    assert.equal(custom?.canonicalModel, "fake-echo");
    assert.equal(custom?.nativeModel, "fake-echo");
    assert.deepEqual(custom?.efforts, ["low"]);

    const resolved = await registry.resolve({
      selector: {
        provider: "harness-relay",
        model: "quick",
        via: "fake",
        requiredCapabilities: [],
      },
      input: [{ type: "text", text: "hello" }],
      workingDirectory: root,
      interactionStrategy: "deny",
      requestedPolicy: { minimumAssurance: "none" },
    });
    assert.equal(resolved.route.model, "quick");
    assert.equal(resolved.route.canonicalModel, "fake-echo");
    assert.equal(resolved.route.nativeModel, "fake-echo");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("adapter route discovery is cached and can be refreshed", async () => {
  const adapter = new CountingAdapter();
  const registry = new AdapterRegistry([adapter]);
  const first = await registry.discover();
  const second = await registry.discover();
  assert.equal(adapter.calls, 1);
  assert.equal(first[0]?.discoveredAt, second[0]?.discoveredAt);
  await registry.discover({ refresh: true });
  assert.equal(adapter.calls, 2);
});

test("user aliases preserve a native harness alias separately from its canonical hint", async () => {
  const routes = await new ClaudeAdapter({
    executable: process.execPath,
    probe: {
      readVersion: async () => "2.1.235 (Claude Code)",
      checkAuthentication: async () => true,
    },
  }).discover();
  const mapped = applyUserModelCatalog(routes, {
    adapters: { claude: { aliases: { quick: "opus" } } },
  });
  const quick = mapped.find((route) => route.adapter === "claude" && route.model === "quick");
  assert.equal(quick?.canonicalModel, "claude-opus-4-8");
  assert.equal(quick?.nativeModel, "opus");
});
