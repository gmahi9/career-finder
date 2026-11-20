import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import {
  ANCHOR_X,
  ANCHOR_Z,
  PATH_FIELDS,
  STILL_TURN,
  adjacentPairs,
  fieldAnchor,
  ringRadius,
  webglAvailable,
} from "../lib/constellation";
import { useCalm } from "../lib/motionPrefs";

const PathScene = lazy(() => import("./PathScene"));

class SceneBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(): void {
    this.props.onFail();
  }

  render(): ReactNode {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function StaticMap() {
  const anchors = PATH_FIELDS.map((field) => fieldAnchor(field, STILL_TURN));
  const pairs = adjacentPairs(PATH_FIELDS);
  return (
    <svg className="constellation-flat" viewBox="0 0 100 100" aria-hidden="true">
      {[0, 1, 2].map((ring) => {
        const radius = ringRadius(ring);
        return (
          <ellipse
            key={ring}
            className={ring === 1 ? "orbit-line warm" : "orbit-line"}
            cx="50"
            cy="50"
            rx={radius * ANCHOR_X}
            ry={radius * 0.62 * ANCHOR_Z}
          />
        );
      })}
      {pairs.map(([from, to]) => (
        <line
          key={`${from}-${to}`}
          className="orbit-link"
          x1={anchors[from].x}
          y1={anchors[from].y}
          x2={anchors[to].x}
          y2={anchors[to].y}
        />
      ))}
      <circle className="orbit-core" cx="50" cy="50" r="1.15" />
      {PATH_FIELDS.map((field, index) => {
        const anchor = anchors[index];
        const dx = anchor.x - 50;
        const dy = anchor.y - 50;
        const span = Math.hypot(dx, dy) || 1;
        const textX = anchor.x + (dx / span) * 5.2;
        const textY = anchor.y + (dy / span) * 3.1;
        const side = dx > 3.5 ? "start" : dx < -3.5 ? "end" : "middle";
        return (
          <g key={field.id}>
            <circle cx={anchor.x} cy={anchor.y} r={field.ring === 0 ? 1.35 : 1.05} fill={field.color} />
            <text x={textX} y={textY} textAnchor={side}>
              {field.short}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Constellation() {
  const calm = useCalm();
  const [allow, setAllow] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setAllow(!calm && webglAvailable());
    if (calm) setReady(false);
  }, [calm]);

  return (
    <div className={ready ? "reel is-live" : "reel"} data-reveal aria-hidden="true">
      <div className="reel-chrome">
        <span>Career paths</span>
        <span>{calm || failed || !allow ? "Still map" : "Follows the pointer"}</span>
      </div>
      <div className="reel-stage">
        <StaticMap />
        {allow && !failed && (
          <SceneBoundary
            onFail={() => {
              setFailed(true);
              setReady(false);
            }}
          >
            <Suspense fallback={null}>
              <div className={ready ? "path-live is-ready" : "path-live"}>
                <PathScene onReady={() => setReady(true)} />
              </div>
            </Suspense>
          </SceneBoundary>
        )}
      </div>
      <p className="reel-note">Twelve fields. The quiz ranks where you fit.</p>
    </div>
  );
}
