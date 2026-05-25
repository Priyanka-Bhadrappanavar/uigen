import { Loader2 } from "lucide-react";

interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "partial-call" | "result";
}

function getLabel(toolName: string, args: Record<string, unknown>): string {
  const path = typeof args.path === "string" ? args.path : undefined;
  const filename = path ? path.split("/").pop() || path : undefined;
  const command = typeof args.command === "string" ? args.command : undefined;

  if (toolName === "str_replace_editor" && command && filename) {
    switch (command) {
      case "create":     return `Creating file: ${filename}`;
      case "str_replace": return `Editing file: ${filename}`;
      case "insert":     return `Editing file: ${filename}`;
      case "view":       return `Viewing file: ${filename}`;
      case "undo_edit":  return `Undoing edit: ${filename}`;
    }
  }

  if (toolName === "file_manager" && command && filename) {
    switch (command) {
      case "rename": return `Renaming file: ${filename}`;
      case "delete": return `Deleting file: ${filename}`;
    }
  }

  return toolName;
}

export function ToolCallBadge({ toolName, args, state }: ToolCallBadgeProps) {
  const label = getLabel(toolName, args);
  const isDone = state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
