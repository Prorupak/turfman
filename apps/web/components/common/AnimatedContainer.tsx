import { useResizeObserver } from "@/hooks/useResizeObserver";
import { cn } from "@turfman/utils";
import { motion } from "framer-motion";
import { forwardRef, useRef } from "react";

type AnimatedSizeContainerProps = {
  width?: boolean;
  height?: boolean;
  className?: string;
  transition?: object;
  children: React.ReactNode;
  [key: string]: any; // Other props
};

/**
 * A container with animated width and height (each optional) based on children dimensions
 */
const AnimatedSizeContainer = forwardRef<
  HTMLDivElement,
  AnimatedSizeContainerProps
>(
  (
    {
      width = false,
      height = false,
      className,
      transition,
      children,
      ...rest
    }: AnimatedSizeContainerProps,
    forwardedRef,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const resizeObserverEntry = useResizeObserver(containerRef);

    return (
      <motion.div
        ref={forwardedRef}
        className={cn("overflow-hidden", className)}
        animate={{
          width: width
            ? resizeObserverEntry?.contentRect?.width ?? "auto"
            : "auto",
          height: height
            ? resizeObserverEntry?.contentRect?.height ?? "auto"
            : "auto",
        }}
        transition={transition ?? { type: "spring", duration: 0.3 }}
        {...rest}
      >
        <div
          ref={containerRef}
          className={cn(height && "h-max", width && "w-max")}
        >
          {children}
        </div>
      </motion.div>
    );
  },
);

AnimatedSizeContainer.displayName = "AnimatedSizeContainer";

export { AnimatedSizeContainer };
