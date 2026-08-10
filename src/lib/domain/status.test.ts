import { describe, expect, it } from "vitest";
import {
  isPubliclyVisible,
  speakerFacingStatus,
  statusLabel,
} from "./status";

describe("speakerFacingStatus", () => {
  it("hides queue statuses as Pending", () => {
    expect(speakerFacingStatus("accept_queue")).toBe("Pending");
    expect(speakerFacingStatus("decline_queue")).toBe("Pending");
    expect(speakerFacingStatus("pending")).toBe("Pending");
  });

  it("passes through terminal statuses", () => {
    expect(speakerFacingStatus("accepted")).toBe("Accepted");
    expect(speakerFacingStatus("declined")).toBe("Declined");
    expect(speakerFacingStatus("draft")).toBe("Draft");
  });
});

describe("statusLabel", () => {
  it("labels accept queue for organizers", () => {
    expect(statusLabel("accept_queue")).toBe("Accept Queue");
  });
});

describe("isPubliclyVisible", () => {
  it("requires accepted + approved", () => {
    expect(
      isPubliclyVisible({ status: "accepted", approvalStatus: "approved" }),
    ).toBe(true);
    expect(
      isPubliclyVisible({ status: "accepted", approvalStatus: "draft" }),
    ).toBe(false);
    expect(
      isPubliclyVisible({ status: "pending", approvalStatus: "approved" }),
    ).toBe(false);
  });
});
