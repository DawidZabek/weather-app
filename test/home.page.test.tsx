import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "../app/page";

// Mock next-auth
vi.mock("next-auth/react", () => {
  return {
    useSession: () => ({ status: "unauthenticated", data: null }),
    signOut: vi.fn(),
  };
});

describe("HomePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders Guest mode", () => {
    render(<HomePage />);
    expect(screen.getByText(/Guest/i)).toBeInTheDocument();
  });

  it("shows Weather Map link", () => {
    render(<HomePage />);
    expect(screen.getByText(/Weather Map/i)).toBeInTheDocument();
  });
});
