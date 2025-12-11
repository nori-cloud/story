"use client";

import { type FormEventHandler, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TextType } from "@/components/text-type";

type Response =
  | {
      state: "idle";
    }
  | {
      state: "loading";
    }
  | {
      state: "loaded";
      message: string;
      audioBase64?: string | null;
    };

type Tone = "serious" | "casual" | "funny" | "crazy";

export function ProfilerUI(props: {
  onSubmit: (
    message: string,
    speed: number,
    tone: Tone,
  ) => Promise<{ text: string; audioBase64?: string | null }>;
}) {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<Response>({
    state: "idle",
  });
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [tone, setTone] = useState<Tone>("casual");
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setResponse({
      state: "loading",
    });

    const data = await props.onSubmit(message, playbackSpeed, tone);

    setResponse({
      state: "loaded",
      message: data.text,
      audioBase64: data.audioBase64,
    });
  };

  const handleShortcut = async (prompt: string) => {
    setMessage(prompt);
    setResponse({
      state: "loading",
    });

    const data = await props.onSubmit(prompt, playbackSpeed, tone);

    setResponse({
      state: "loaded",
      message: data.text,
      audioBase64: data.audioBase64,
    });
  };

  useEffect(() => {
    if (
      response.state === "loaded" &&
      response.audioBase64 &&
      audioRef.current
    ) {
      audioRef.current.src = `data:audio/wav;base64,${response.audioBase64}`;
      audioRef.current.play();
    }
  }, [response]);

  return (
    <form className="flex-1 w-full flex flex-col mt-4" onSubmit={handleSubmit}>
      {response.state === "idle" && (
        <TypeingText
          text={
            "Hi! I'm here to help you learn about Norris. What would you like to know?"
          }
        />
      )}
      {response.state === "loading" && <TypeingText text={"Thinking......"} />}
      {response.state === "loaded" && <TypeingText text={response.message} />}
      <div className="mt-auto mb-3 flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleShortcut("Tell me about Norris's career")}
          disabled={response.state === "loading"}
        >
          Career
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleShortcut("Tell me about Norris's lifestyle")}
          disabled={response.state === "loading"}
        >
          Lifestyle
        </Button>
      </div>
      <div className="flex gap-2 items-center">
        <Input
          className="flex-1 text-base placeholder:text-base"
          type="text"
          name="message"
          placeholder="write your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <select
          className="px-2 py-2 border rounded-md text-sm bg-background"
          value={tone}
          onChange={(e) => setTone(e.target.value as Tone)}
          title="Tone"
        >
          <option value="casual">Casual</option>
          <option value="serious">Serious</option>
          <option value="funny">Funny</option>
          <option value="crazy">Crazy</option>
        </select>
        <select
          className="px-2 py-2 border rounded-md text-sm bg-background"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          title="Speech speed"
        >
          <option value={0.5}>0.5x</option>
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>
      {/* biome-ignore lint/a11y/useMediaCaption: TTS audio reads text already displayed on screen */}
      <audio ref={audioRef} hidden />
    </form>
  );
}

function TypeingText(props: { text: string }) {
  return (
    <TextType
      className="text-4xl"
      text={props.text}
      loop={false}
      typingSpeed={10}
      showCursor={false}
    />
  );
}
