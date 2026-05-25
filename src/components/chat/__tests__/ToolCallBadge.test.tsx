import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// str_replace_editor label tests
test("shows 'Creating file' for str_replace_editor create command", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/src/Button.tsx" }} state="result" />);
  expect(screen.getByText("Creating file: Button.tsx")).toBeDefined();
});

test("shows 'Editing file' for str_replace_editor str_replace command", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "str_replace", path: "/src/App.tsx" }} state="result" />);
  expect(screen.getByText("Editing file: App.tsx")).toBeDefined();
});

test("shows 'Editing file' for str_replace_editor insert command", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "insert", path: "/src/App.tsx" }} state="result" />);
  expect(screen.getByText("Editing file: App.tsx")).toBeDefined();
});

test("shows 'Viewing file' for str_replace_editor view command", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "view", path: "/src/index.ts" }} state="result" />);
  expect(screen.getByText("Viewing file: index.ts")).toBeDefined();
});

test("shows 'Undoing edit' for str_replace_editor undo_edit command", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "undo_edit", path: "/src/App.tsx" }} state="result" />);
  expect(screen.getByText("Undoing edit: App.tsx")).toBeDefined();
});

// file_manager label tests
test("shows 'Renaming file' for file_manager rename command", () => {
  render(<ToolCallBadge toolName="file_manager" args={{ command: "rename", path: "/src/Old.tsx" }} state="result" />);
  expect(screen.getByText("Renaming file: Old.tsx")).toBeDefined();
});

test("shows 'Deleting file' for file_manager delete command", () => {
  render(<ToolCallBadge toolName="file_manager" args={{ command: "delete", path: "/src/Card.tsx" }} state="result" />);
  expect(screen.getByText("Deleting file: Card.tsx")).toBeDefined();
});

// uses only basename from a deep path
test("uses only the filename, not the full path", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/a/b/c/Deep.tsx" }} state="result" />);
  expect(screen.getByText("Creating file: Deep.tsx")).toBeDefined();
});

// fallback for unknown tools / missing args
test("falls back to raw toolName for unknown tool", () => {
  render(<ToolCallBadge toolName="unknown_tool" args={{}} state="result" />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("falls back to raw toolName when args are missing command", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ path: "/src/App.tsx" }} state="result" />);
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("falls back to raw toolName when args are missing path", () => {
  render(<ToolCallBadge toolName="str_replace_editor" args={{ command: "create" }} state="result" />);
  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

// state indicator tests
test("shows green dot when state is result", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/src/App.tsx" }} state="result" />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when state is call", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/src/App.tsx" }} state="call" />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows spinner when state is partial-call", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/src/App.tsx" }} state="partial-call" />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});
