import { CloudSun, Droplets, Sun, ThermometerSun, Umbrella } from "lucide-react";
import Matter from "matter-js";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { departureAdvice, weatherSnapshot } from "./data/dashboard";

type BubbleId = "clock" | "weather" | "advice";

type BubbleFrame = {
  id: BubbleId;
  x: number;
  y: number;
  angle: number;
};

type BubbleDefinition = {
  id: BubbleId;
  className: string;
  width: number;
  height: number;
  radius: number;
  x: number;
  y: number;
  mass: number;
};

function getBubbleDefinitions(width: number, height: number): BubbleDefinition[] {
  const minSide = Math.min(width, height);
  const scale = Math.max(0.72, Math.min(1.18, minSide / 760));
  const compact = width < 760;

  if (compact) {
    return [
      {
        id: "clock",
        className: "bubble-clock",
        width: 235 * scale,
        height: 150 * scale,
        radius: 112 * scale,
        x: width * 0.35,
        y: height * 0.22,
        mass: 1,
      },
      {
        id: "weather",
        className: "bubble-weather",
        width: 285 * scale,
        height: 330 * scale,
        radius: 168 * scale,
        x: width * 0.62,
        y: height * 0.47,
        mass: 1.45,
      },
      {
        id: "advice",
        className: "bubble-advice",
        width: Math.min(width * 0.86, 560 * scale),
        height: 185 * scale,
        radius: 235 * scale,
        x: width * 0.5,
        y: height * 0.78,
        mass: 1.8,
      },
    ];
  }

  return [
    {
      id: "clock",
      className: "bubble-clock",
      width: 260 * scale,
      height: 160 * scale,
      radius: 123 * scale,
      x: width * 0.23,
      y: height * 0.25,
      mass: 1,
    },
    {
      id: "weather",
      className: "bubble-weather",
      width: 320 * scale,
      height: 385 * scale,
      radius: 190 * scale,
      x: width * 0.52,
      y: height * 0.38,
      mass: 1.5,
    },
    {
      id: "advice",
      className: "bubble-advice",
      width: 560 * scale,
      height: 210 * scale,
      radius: 280 * scale,
      x: width * 0.67,
      y: height * 0.72,
      mass: 2,
    },
  ];
}

function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}

function useBubblePhysics(definitions: BubbleDefinition[], width: number, height: number) {
  const [frames, setFrames] = useState<BubbleFrame[]>(() =>
    definitions.map((definition) => ({
      id: definition.id,
      x: definition.x,
      y: definition.y,
      angle: 0,
    })),
  );
  const bodiesRef = useRef<Map<BubbleId, Matter.Body>>(new Map());

  useEffect(() => {
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
    const runner = Matter.Runner.create();
    const margin = 52;

    const walls = [
      Matter.Bodies.rectangle(width / 2, -margin, width + margin * 2, margin * 2, { isStatic: true }),
      Matter.Bodies.rectangle(width / 2, height + margin, width + margin * 2, margin * 2, { isStatic: true }),
      Matter.Bodies.rectangle(-margin, height / 2, margin * 2, height + margin * 2, { isStatic: true }),
      Matter.Bodies.rectangle(width + margin, height / 2, margin * 2, height + margin * 2, { isStatic: true }),
    ];

    const bodies = definitions.map((definition, index) => {
      const body = Matter.Bodies.circle(definition.x, definition.y, definition.radius, {
        friction: 0,
        frictionAir: 0.038,
        restitution: 0.96,
        density: 0.0008,
        label: definition.id,
      });

      Matter.Body.setMass(body, definition.mass);
      Matter.Body.setVelocity(body, {
        x: (index + 1) * 0.32 * (index % 2 === 0 ? 1 : -1),
        y: (index + 1) * 0.18,
      });
      bodiesRef.current.set(definition.id, body);
      return body;
    });

    Matter.Composite.add(engine.world, [...walls, ...bodies]);
    Matter.Runner.run(runner, engine);

    let animationFrame = 0;
    let tick = 0;

    const animate = () => {
      tick += 1;

      bodies.forEach((body, index) => {
        const phase = tick / 95 + index * 1.7;
        Matter.Body.applyForce(body, body.position, {
          x: Math.cos(phase) * 0.00028 * body.mass,
          y: Math.sin(phase * 0.9) * 0.00022 * body.mass,
        });
        Matter.Body.setAngularVelocity(body, Math.sin(phase) * 0.002);
      });

      setFrames(
        bodies.map((body) => ({
          id: body.label as BubbleId,
          x: body.position.x,
          y: body.position.y,
          angle: body.angle,
        })),
      );

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      bodiesRef.current.clear();
    };
  }, [definitions, height, width]);

  const nudge = (id: BubbleId) => {
    const body = bodiesRef.current.get(id);
    if (!body) {
      return;
    }

    Matter.Body.applyForce(body, body.position, {
      x: (Math.random() - 0.5) * 0.035 * body.mass,
      y: -0.026 * body.mass,
    });
  };

  return { frames, nudge };
}

function ClockBubble() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const time = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const date = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);

  return (
    <div className="bubble-content clock-content">
      <span className="eyebrow">现在</span>
      <strong>{time}</strong>
      <span>{date}</span>
    </div>
  );
}

function WeatherBubble() {
  return (
    <div className="bubble-content weather-content">
      <CloudSun className="weather-icon" aria-hidden="true" />
      <span className="eyebrow">今日天气</span>
      <strong>{weatherSnapshot.temperature}°</strong>
      <span className="condition">{weatherSnapshot.condition}</span>
      <div className="weather-metrics" aria-label="天气细节">
        <span>
          <ThermometerSun aria-hidden="true" />
          {weatherSnapshot.low}° / {weatherSnapshot.high}°
        </span>
        <span>
          <Droplets aria-hidden="true" />
          湿度 {weatherSnapshot.humidity}%
        </span>
        <span>
          <Sun aria-hidden="true" />
          UV {weatherSnapshot.uv}
        </span>
      </div>
    </div>
  );
}

function AdviceBubble() {
  return (
    <div className="bubble-content advice-content">
      <Umbrella className="advice-icon" aria-hidden="true" />
      <span className="eyebrow">出门一句话</span>
      <strong>{departureAdvice.headline}</strong>
      <span>{departureAdvice.detail}</span>
      <div className="advice-tags">
        {departureAdvice.tags.map((tag) => (
          <span key={tag.label}>{tag.label}</span>
        ))}
      </div>
    </div>
  );
}

function App() {
  const { width, height } = useWindowSize();
  const definitions = useMemo(() => getBubbleDefinitions(width, height), [height, width]);
  const { frames, nudge } = useBubblePhysics(definitions, width, height);

  const frameById = new Map(frames.map((frame) => [frame.id, frame]));

  return (
    <main className="kiosk-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <section className="bubble-stage" aria-label="玄关天气信息">
        {definitions.map((definition) => {
          const frame = frameById.get(definition.id);
          const content =
            definition.id === "clock" ? (
              <ClockBubble />
            ) : definition.id === "weather" ? (
              <WeatherBubble />
            ) : (
              <AdviceBubble />
            );

          return (
            <motion.article
              animate={{
                x: (frame?.x ?? definition.x) - definition.width / 2,
                y: (frame?.y ?? definition.y) - definition.height / 2,
                rotate: (frame?.angle ?? 0) * 16,
              }}
              className={`info-bubble ${definition.className}`}
              initial={{ opacity: 0, scale: 0.88 }}
              key={definition.id}
              onPointerDown={() => nudge(definition.id)}
              style={{ width: definition.width, height: definition.height }}
              transition={{ type: "spring", stiffness: 68, damping: 18, mass: 0.7 }}
            >
              {content}
            </motion.article>
          );
        })}
      </section>
    </main>
  );
}

export default App;
