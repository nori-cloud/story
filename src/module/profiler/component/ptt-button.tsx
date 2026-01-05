import { Button } from "@/components/ui/button";

type PTTButtonProps = {
  isRecording: boolean;
  disabled: boolean;
  onStart: () => void;
  onStop: () => void;
};

export function PTTButton({
  isRecording,
  disabled,
  onStart,
  onStop,
}: PTTButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant={isRecording ? "destructive" : "default"}
      onMouseDown={onStart}
      onMouseUp={onStop}
      onTouchStart={onStart}
      onTouchEnd={onStop}
      disabled={disabled}
      className="shrink-0"
      title={isRecording ? "Release to send" : "Hold to talk"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    </Button>
  );
}
