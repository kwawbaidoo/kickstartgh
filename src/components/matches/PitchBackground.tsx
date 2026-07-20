import { cn } from "@/lib/utils";

const STRIPE_COUNT = 10;
const STRIPE_HEIGHT = 500 / STRIPE_COUNT;
const STRIPE_COLORS = ["#3f9142", "#469a4b"];

/**
 * Authored once in a canonical portrait (340×500) coordinate space. The
 * landscape variant reuses this unchanged, just rotated 90° in an <svg> with
 * a swapped viewBox — so both orientations stay pixel-consistent with a
 * single source of truth instead of two hand-drawn pitches drifting apart.
 */
function PitchMarkings() {
  return (
    <>
      {Array.from({ length: STRIPE_COUNT }).map((_, index) => (
        <rect
          key={index}
          x={0}
          y={index * STRIPE_HEIGHT}
          width={340}
          height={STRIPE_HEIGHT}
          fill={STRIPE_COLORS[index % 2]}
        />
      ))}

      <rect x={10} y={10} width={320} height={480} fill="none" stroke="white" strokeWidth={3} />
      <line x1={10} y1={250} x2={330} y2={250} stroke="white" strokeWidth={3} />
      <circle cx={170} cy={250} r={55} fill="none" stroke="white" strokeWidth={3} />
      <circle cx={170} cy={250} r={3.5} fill="white" />

      {/* Top penalty area */}
      <rect x={60} y={10} width={220} height={90} fill="none" stroke="white" strokeWidth={3} />
      <rect x={115} y={10} width={110} height={35} fill="none" stroke="white" strokeWidth={3} />
      <path d="M 122 100 A 55 55 0 0 0 218 100" fill="none" stroke="white" strokeWidth={3} />
      <circle cx={170} cy={75} r={3} fill="white" />
      <rect x={150} y={3} width={40} height={7} fill="none" stroke="white" strokeWidth={3} />

      {/* Bottom penalty area (mirrored) */}
      <rect x={60} y={400} width={220} height={90} fill="none" stroke="white" strokeWidth={3} />
      <rect x={115} y={455} width={110} height={35} fill="none" stroke="white" strokeWidth={3} />
      <path d="M 122 400 A 55 55 0 0 1 218 400" fill="none" stroke="white" strokeWidth={3} />
      <circle cx={170} cy={425} r={3} fill="white" />
      <rect x={150} y={490} width={40} height={7} fill="none" stroke="white" strokeWidth={3} />

      {/* Corner arcs */}
      <path d="M 10 26 A 16 16 0 0 0 26 10" fill="none" stroke="white" strokeWidth={2} />
      <path d="M 314 10 A 16 16 0 0 0 330 26" fill="none" stroke="white" strokeWidth={2} />
      <path d="M 330 474 A 16 16 0 0 0 314 490" fill="none" stroke="white" strokeWidth={2} />
      <path d="M 26 490 A 16 16 0 0 0 10 474" fill="none" stroke="white" strokeWidth={2} />
    </>
  );
}

type PitchBackgroundProps = {
  className?: string;
};

function PitchBackground({ className }: PitchBackgroundProps) {
  return (
    <div className={cn("absolute inset-0", className)} aria-hidden="true">
      <svg viewBox="0 0 340 500" className="block size-full lg:hidden">
        <PitchMarkings />
      </svg>
      <svg viewBox="0 0 500 340" className="hidden size-full lg:block">
        <g transform="translate(80,-80) rotate(90,170,250)">
          <PitchMarkings />
        </g>
      </svg>
    </div>
  );
}

export { PitchBackground };
