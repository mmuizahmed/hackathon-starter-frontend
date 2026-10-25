import { useId } from "react";
import { STATUS } from "./frame";

export function FacePreview({ videoRef, faceBox, frameWidth, frameHeight, status, error }) {
  const maskId = useId().replace(/:/g, "");
  const width = frameWidth || 480;
  const height = frameHeight || 640;
  const label = error || status || STATUS.camera;
  const ready = status === STATUS.blinked;

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="relative -scale-x-100 overflow-hidden rounded-card bg-zinc-950">
        <video
          ref={videoRef}
          className="aspect-[3/4] w-full object-contain sm:aspect-[4/5]"
          playsInline
          muted
          autoPlay
          aria-label="Camera preview"
        />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <mask id={maskId}>
              <rect width={width} height={height} fill="white" />
              <ellipse cx={width / 2} cy={height * 0.46} rx={width * 0.28} ry={height * 0.32} fill="black" />
            </mask>
          </defs>
          <rect width={width} height={height} fill="rgb(9 9 11 / 0.5)" mask={`url(#${maskId})`} />
          <ellipse
            cx={width / 2}
            cy={height * 0.46}
            rx={width * 0.28}
            ry={height * 0.32}
            fill="none"
            stroke={ready ? "#5eead4" : "#e4e4e7"}
            strokeWidth={Math.max(3, width / 140)}
          />
          {faceBox ? (
            <rect
              x={faceBox.x}
              y={faceBox.y}
              width={faceBox.width}
              height={faceBox.height}
              fill="none"
              stroke="#5eead4"
              strokeWidth={Math.max(3, width / 160)}
              rx="8"
            />
          ) : null}
        </svg>
      </div>
      <p
        role="status"
        className="absolute inset-x-3 bottom-3 rounded-control bg-zinc-950/80 px-3 py-2 text-center text-sm font-medium text-white"
      >
        {label}
      </p>
    </div>
  );
}
