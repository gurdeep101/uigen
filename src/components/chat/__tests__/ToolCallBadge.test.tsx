import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

// str_replace_editor — create
test("shows 'Creating <filename>' for str_replace_editor create command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

// str_replace_editor — str_replace
test("shows 'Editing <filename>' for str_replace_editor str_replace command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/components/Button.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing Button.tsx")).toBeDefined();
});

// str_replace_editor — insert
test("shows 'Editing <filename>' for str_replace_editor insert command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "insert", path: "/src/index.tsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing index.tsx")).toBeDefined();
});

// str_replace_editor — view
test("shows 'Reading <filename>' for str_replace_editor view command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "view", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Reading App.jsx")).toBeDefined();
});

// file_manager — delete
test("shows 'Deleting <filename>' for file_manager delete command", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "delete", path: "/old-component.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Deleting old-component.jsx")).toBeDefined();
});

// file_manager — rename
test("shows 'Renaming to <new filename>' for file_manager rename command", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "rename", path: "/Button.jsx", new_path: "/components/Button.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Renaming to Button.jsx")).toBeDefined();
});

// In-progress state shows spinner (no green dot)
test("shows spinner when state is 'call'", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  // Spinner has animate-spin class; green dot does not
  expect(container.querySelector(".animate-spin")).toBeTruthy();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

// Completed state shows green dot (no spinner)
test("shows green dot when state is 'result'", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

// Unknown tool falls back to humanised tool name
test("humanises unknown tool names as fallback", () => {
  render(
    <ToolCallBadge
      toolName="some_custom_tool"
      args={{}}
      state="call"
    />
  );
  expect(screen.getByText("some custom tool")).toBeDefined();
});

// Missing path falls back gracefully
test("falls back gracefully when path is missing", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating file")).toBeDefined();
});
