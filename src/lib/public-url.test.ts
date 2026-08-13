import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { publicOrigin, publicUrl } from "./public-url";

const saved = {
  APP_URL: process.env.APP_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  PORT: process.env.PORT,
};

afterEach(() => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function request(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers });
}

describe("publicOrigin", () => {
  it("prefers APP_URL over a 0.0.0.0 request.url", () => {
    process.env.APP_URL = "https://conferencer.cc";
    const req = request("https://0.0.0.0:3000/sign-out");
    assert.equal(publicOrigin(req), "https://conferencer.cc");
    assert.equal(publicUrl("/", req), "https://conferencer.cc/");
  });

  it("strips a trailing slash from APP_URL", () => {
    process.env.APP_URL = "https://conferencer.cc/";
    assert.equal(publicOrigin(), "https://conferencer.cc");
  });

  it("uses x-forwarded-host when APP_URL is unset", () => {
    delete process.env.APP_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    const req = request("https://0.0.0.0:3000/sign-out", {
      "x-forwarded-host": "conferencer.cc",
      "x-forwarded-proto": "https",
    });
    assert.equal(publicOrigin(req), "https://conferencer.cc");
    assert.equal(publicUrl("/", req), "https://conferencer.cc/");
  });

  it("ignores a bind-address Host header", () => {
    delete process.env.APP_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    process.env.PORT = "3000";
    const req = request("https://0.0.0.0:3000/sign-out", {
      host: "0.0.0.0:3000",
    });
    assert.equal(publicOrigin(req), "http://localhost:3000");
  });
});
