"use client";

import { motion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";

type Dimension = {
  width: number;
  height: number;
};

type SlideContainerProps = {
  dimension: Dimension;
  children: React.ReactNode;
  title: string;
};

function SlideContainer({ dimension, children, title }: SlideContainerProps) {
  return (
    <div
      className="snap-start snap-always flex items-center justify-center"
      style={{ width: dimension.width, height: dimension.height }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "linear" }}
        viewport={{ once: true, amount: 0.5 }}
        className="flex flex-col size-full relative py-4"
      >
        <div className="my-auto">{children}</div>

        <span className="text-xl uppercase text-neutral-300 font-bold">
          {title}
        </span>
      </motion.div>
    </div>
  );
}

export type Slide = {
  title: string;
  component: React.ReactNode;
};
export function Presentation(props: { slides: Slide[] }) {
  const containerRef = useRef<React.ComponentRef<"div">>(null);
  const [sectionDimension, setSectionDimension] = useState<Dimension>({
    width: 0,
    height: 0,
  });

  useLayoutEffect(() => {
    const contaienr = containerRef.current;
    if (!contaienr) return;
    const updateSectionDimension = () => {
      setSectionDimension({
        width: contaienr.offsetWidth,
        height: contaienr.offsetHeight,
      });
    };

    updateSectionDimension();
  }, []);

  return (
    <div
      id="scrolling-container"
      ref={containerRef}
      className="flex-1 size-full overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {props.slides.map((s) => (
        <SlideContainer
          key={s.title}
          dimension={sectionDimension}
          title={s.title}
        >
          {s.component}
        </SlideContainer>
      ))}
    </div>
  );
}
