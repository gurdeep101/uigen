import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "partial-call" | "call" | "result";
}

/** Returns a human-readable label describing what a tool call is doing. */
function getLabel(toolName: string, args: Record<string, unknown>): string {
  const path = typeof args.path === "string" ? args.path : null;
  const filename = path ? path.split("/").pop() || path : null;

  if (toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    switch (command) {
      case "create":
        return filename ? `Creating ${filename}` : "Creating file";
      case "str_replace":
      case "insert":
        return filename ? `Editing ${filename}` : "Editing file";
      case "view":
        return filename ? `Reading ${filename}` : "Reading file";
      default:
        return filename ? `Editing ${filename}` : "Editing file";
    }
  }

  if (toolName === "file_manager") {
    const command = args.command as string | undefined;
    if (command === "delete") return filename ? `Deleting ${filename}` : "Deleting file";
    if (command === "rename") {
      const newPath = typeof args.new_path === "string" ? args.new_path : null;
      const newFilename = newPath ? newPath.split("/").pop() || newPath : null;
      return newFilename ? `Renaming to ${newFilename}` : "Renaming file";
    }
    return filename ? `Managing ${filename}` : "Managing file";
  }

  // Fallback for unknown tools: humanise the tool name
  return toolName.replace(/_/g, " ");
}

export function ToolCallBadge({ toolName, args, state }: ToolCallBadgeProps) {
  const label = getLabel(toolName, args);
  const done = state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
