type Status = "idle" | "recording" | "transcribing" | "generating";

type StatusConfig = {
  color: string;
  text: string;
};

const statusMap: Record<Status, StatusConfig> = {
  idle: { color: "bg-gray-500", text: "Ready" },
  recording: { color: "bg-red-500", text: "Recording..." },
  transcribing: { color: "bg-yellow-500", text: "Transcribing..." },
  generating: { color: "bg-blue-500", text: "Responding..." },
};

export function StatusIndicator({ status }: { status: Status }) {
  if (status === "idle") return null;

  const config = statusMap[status];

  return (
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <span className="text-sm text-muted-foreground">{config.text}</span>
    </div>
  );
}
