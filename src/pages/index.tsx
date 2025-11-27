import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { ShinyText } from "@/components/shiny-text";
import { RotatingText } from "@/components/rotating-text";
import { PixelBlast } from "@/components/pixel-blast";
import { Button } from "@/components/ui/button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {

  const alias = ["Norris Wu", "Software Engineer", "Half-Ass Cook", "Sloppy Drawer", "Day-Dreamer", "Cheapskate Tinker",]

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black`}
    >
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start z-10">
        <ShinyText
          text="STORY"
          speed={3}
          className="text-3xl"
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <RotatingText
            texts={alias}
            mainClassName="text-5xl"
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={3 * 1000}
          />

          <Button>
            Let's Hear it
          </Button>
        </div>

        <div>Prototyped By Nori-Cloud</div>
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
