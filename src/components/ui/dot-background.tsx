import { cn } from "@/lib/utils";

export function DotBackgroundDemo() {
  return (
    <>
      <div
        className={cn(
          "absolute inset-0 -z-30",
          "[background-size:20px_20px]",
          //   "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "[background-image:radial-gradient(#404040_1px,transparent_1px)]"
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
    </>
  );
}
