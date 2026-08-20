import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEMO_ACCOUNTS,
  demoEnterHref,
  demoLlmsTxt,
  demoRobotsTxt,
  resolveDemoRole,
  safeNextPath,
} from "./demo-login";

describe("resolveDemoRole", () => {
  it("defaults empty input to organizer", () => {
    assert.equal(resolveDemoRole(undefined), "organizer");
    assert.equal(resolveDemoRole(null), "organizer");
    assert.equal(resolveDemoRole(""), "organizer");
  });

  it("accepts aliases a crawler is likely to guess", () => {
    assert.equal(resolveDemoRole("organizer"), "organizer");
    assert.equal(resolveDemoRole("organiser"), "organizer");
    assert.equal(resolveDemoRole("admin"), "organizer");
    assert.equal(resolveDemoRole("reviewer"), "reviewer");
    assert.equal(resolveDemoRole("speaker"), "speaker");
    assert.equal(resolveDemoRole("SPEAKER2"), "speaker2");
  });

  it("rejects unknown roles instead of silently logging someone in", () => {
    assert.equal(resolveDemoRole("superadmin"), null);
    assert.equal(resolveDemoRole(".."), null);
  });
});

describe("demoEnterHref", () => {
  it("is a GET path, not a POST form action", () => {
    assert.equal(demoEnterHref(), "/demo");
    assert.equal(demoEnterHref(undefined, "reviewer"), "/demo/reviewer");
    assert.equal(
      demoEnterHref("/admin/e/devflow-conf-2027/agenda"),
      "/demo?next=%2Fadmin%2Fe%2Fdevflow-conf-2027%2Fagenda",
    );
  });
});

describe("safeNextPath", () => {
  it("only allows same-origin relative paths", () => {
    assert.equal(safeNextPath("/admin"), "/admin");
    assert.equal(safeNextPath("/review?x=1"), "/review?x=1");
    assert.equal(safeNextPath("https://evil.test/"), null);
    assert.equal(safeNextPath("//evil.test"), null);
    assert.equal(safeNextPath("/\\evil"), null);
  });
});

describe("DEMO_ACCOUNTS", () => {
  it("maps every contest persona to a seeded example.com inbox", () => {
    assert.equal(DEMO_ACCOUNTS.organizer.email, "demo-organizer@example.com");
    assert.equal(DEMO_ACCOUNTS.reviewer.email, "demo-reviewer@example.com");
    assert.equal(DEMO_ACCOUNTS.speaker.email, "demo-speaker@example.com");
    assert.equal(DEMO_ACCOUNTS.speaker2.email, "demo-speaker2@example.com");
  });
});

describe("crawler documents", () => {
  it("robots.txt is text, allows everything, and points at /demo", () => {
    const body = demoRobotsTxt();
    assert.match(body, /User-agent:\s*\*/i);
    assert.match(body, /Allow:\s*\//);
    assert.match(body, /ai-input=yes/);
    assert.match(body, /\/demo/);
    assert.doesNotMatch(body, /<html/i);
  });

  it("llms.txt tells the agent to follow /demo", () => {
    const body = demoLlmsTxt();
    assert.match(body, /Follow .*\/demo/i);
    assert.match(body, /\/demo\/reviewer/);
    assert.match(body, /\/demo\/speaker/);
    assert.doesNotMatch(body, /<html/i);
  });
});
