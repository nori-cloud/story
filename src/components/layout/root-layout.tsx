import { Geist, Geist_Mono } from "next/font/google";
import type React from "react";
import { PixelBlast } from "@/components/pixel-blast";
import { ShinyText } from "../shiny-text";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
};
export function RootLayout({ children }: Props) {
  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex min-h-dvh items-center justify-center bg-zinc-50 font-sans dark:bg-black`}
    >
      <main className="flex min-h-dvh max-h-dvh w-full max-w-4xl flex-col p-4 md:py-32 md:px-16 bg-white dark:bg-black sm:items-start z-10 overflow-x-hidden overflow-y-auto">
        <Link href="/">
          <ShinyText text="STORY_v0.4.x" speed={3} className="text-3xl" />
        </Link>

        {children}
      </main>

      <div className="absolute inset-0">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#176ff3"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>
    </div>
  );
}
