import FuzzyText from "@/components/fuzzy-text";
import { RotatingText } from "@/components/rotating-text";
import { ShinyText } from "@/components/shiny-text";
import { TextType } from "@/components/text-type";
import { cn } from "@/lib/utils";
import { Presentation, type Slide } from "./prensentation";

export default function AboutPage() {
  const sections: Slide[] = [
    { title: "The Reality", component: <TheReality /> },
    { title: "The Challenges", component: <TheChallenges /> },
    { title: "The Challenges", component: <TheNoise /> },
    { title: "The Question", component: <TheQuestion /> },
    { title: "The Idea", component: <TheIdeaPart1 /> },
    { title: "The Idea", component: <TheIdeaPart2 /> },
    { title: "The Idea", component: <TheIdeaPart3 /> },
    { title: "The Experience", component: <TheExperience /> },
    { title: "The Outro", component: <TheOutro /> },
  ];

  return <Presentation slides={sections} />;
}

function Keyword({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <strong className={cn("text-indigo-500 text-5xl uppercase", className)}>
      {children}
    </strong>
  );
}

function TheReality() {
  return (
    <div className="flex flex-col gap-8">
      <Keyword className="text-center">sohac</Keyword>
      <p className="text-xl mb-4 text-center">
        an oddly familiar imaginary realm
      </p>

      <ul className="text-3xl space-y-8 text-center">
        <li>Emerging Technological Revolution</li>
        <li>Global Power Shift</li>
        <li>Clash of Culture and Experiences</li>
        <li>"Too Much" and "Too Fast"</li>
      </ul>
    </div>
  );
}

function TheChallenges() {
  return (
    <div className="flex flex-col gap-12 items-center px-4">
      <p className="flex self-start items-end text-4xl">
        Social<FuzzyText fontSize={40}>Instability</FuzzyText>
      </p>

      <div className="w-full ring-1"></div>

      <p className="flex self-end items-end text-4xl">
        <FuzzyText fontSize={40}>Disrupting</FuzzyText>Technology
      </p>

      <div className="w-full ring-1"></div>

      <p className="flex self-start items-end text-4xl">
        Financial <FuzzyText fontSize={40}>vulnerability</FuzzyText>
      </p>
    </div>
  );
}

function TheNoise() {
  return (
    <div className="flex flex-col gap-12 items-center px-4">
      <FuzzyText fontSize={40}>Constant</FuzzyText>
      <FuzzyText fontSize={40}>Noise</FuzzyText>
    </div>
  );
}

function TheQuestion() {
  return (
    <div className="flex flex-col gap-12 items-center px-4">
      <p>What the do I do?</p>
    </div>
  );
}

function TheIdeaPart1() {
  return (
    <>
      <div className="mb-6">
        <ShinyText text="STORY" speed={3} className="text-6xl text-blue-500" />
      </div>
      <p className="text-3xl mb-4">
        Your digital companion that wants to know you and in return, helps you
        knows yourself.
      </p>
    </>
  );
}

function TheIdeaPart2() {
  return (
    <div className="flex flex-col items-center gap-4 justify-center">
      <span className="text-3xl">
        <Keyword>STORY</Keyword> is NOT...
      </span>
      <RotatingText
        className="text-8xl"
        rotationInterval={3 * 1000}
        texts={["A Manager", "A Overseer", "A Supervisor"]}
      />
    </div>
  );
}

function TheIdeaPart3() {
  return (
    <div className="flex flex-col items-center gap-4 justify-center">
      <span className="text-3xl">
        <Keyword>STORY</Keyword> is...
      </span>
      <RotatingText
        className="text-6xl text-center"
        rotationInterval={3 * 1000}
        texts={["A Friend", "A Mentor", "Yourself"]}
      />
    </div>
  );
}

function TheExperience() {
  const useCases = [
    "Connects with your social platform, whether LinkedIn, Facebook, Instagram...",
    "Leveraging the power of AI to help people gain a better understanding of themselves",
    "Safe, Your Story, Your Data, Your Rule.",
  ];

  return (
    <div className="text-3xl">
      <TextType
        text={useCases}
        startOnVisible={true}
        loop={true}
        pauseDuration={5000}
        deletingSpeed={10}
        typingSpeed={30}
      />
    </div>
  );
}

function TheOutro() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-center">
        So... What's your <Keyword>STORY</Keyword>?
      </h1>
      <p className="italic text-base text-muted-foreground">
        psss, there might be technical demo...
      </p>
    </div>
  );
}
