import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RotatingText } from "@/components/rotating-text";
import { ShinyText } from "@/components/shiny-text";

export default function Home() {
  const alias = [
    "Norris Wu",
    "Software Engineer",
    "Half-Ass Cook",
    "Sloppy Drawer",
    "Day-Dreamer",
    "Cheapskate Tinker",
  ];

  return (
    <div className="flex-1 w-full flex flex-col justify-between">
      <div />
      <div className="flex flex-col gap-6 text-center h-50 md:h-auto justify-between items-start">
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

        <Button>Let's Hear it</Button>
      </div>

      <div className="flex justify-between w-full items ">
        <span>Prototyped By Nori-Cloud</span>

        <nav>
          <Link
            href="/about"
            className="text-neutral-500 font-bold hover:border-b "
          >
            About
          </Link>
        </nav>
      </div>
    </div>
  );
}
