import { CloudSun, Droplets, Sun, ThermometerSun, Umbrella } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { departureAdvice, weatherSnapshot } from "./data/dashboard";

type BubbleId = "clock" | "weather" | "advice";

type BubbleLayout = Record<BubbleId, { x: number; y: number }>;

type BubbleDefinition = {
  id: BubbleId;
  className: string;
  width: number;
  height: number;
  x: number;
  y: number;
};

const layoutStorageKey = "kiosk-bubble-layout-round-v1";

const desktopLayout: BubbleLayout = {
  clock: { x: 0.24, y: 0.72 },
  weather: { x: 0.29, y: 0.34 },
  advice: { x: 0.7, y: 0.48 },
};

const compactLayout: BubbleLayout = {
  clock: { x: 0.35, y: 0.22 },
  weather: { x: 0.62, y: 0.47 },
  advice: { x: 0.5, y: 0.77 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getDefaultLayout(compact: boolean) {
  return compact ? compactLayout : desktopLayout;
}

function getStoredLayout(compact: boolean): BubbleLayout {
  const fallback = getDefaultLayout(compact);
  const stored = window.localStorage.getItem(layoutStorageKey);

  if (!stored) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<BubbleLayout>;
    return {
      clock: parsed.clock ?? fallback.clock,
      weather: parsed.weather ?? fallback.weather,
      advice: parsed.advice ?? fallback.advice,
    };
  } catch {
    return fallback;
  }
}

function getBubbleDefinitions(width: number, height: number, layout: BubbleLayout): BubbleDefinition[] {
  const minSide = Math.min(width, height);
  const scale = Math.max(0.72, Math.min(1.18, minSide / 760));
  const compact = width < 760;

  if (compact) {
    return [
      {
        id: "clock",
        className: "bubble-clock",
        width: 210 * scale,
        height: 210 * scale,
        x: width * layout.clock.x,
        y: height * layout.clock.y,
      },
      {
        id: "weather",
        className: "bubble-weather",
        width: 310 * scale,
        height: 310 * scale,
        x: width * layout.weather.x,
        y: height * layout.weather.y,
      },
      {
        id: "advice",
        className: "bubble-advice",
        width: Math.min(width * 0.78, 330 * scale),
        height: Math.min(width * 0.78, 330 * scale),
        x: width * layout.advice.x,
        y: height * layout.advice.y,
      },
    ];
  }

  return [
    {
      id: "clock",
      className: "bubble-clock",
      width: 245 * scale,
      height: 245 * scale,
      x: width * layout.clock.x,
      y: height * layout.clock.y,
    },
    {
      id: "weather",
      className: "bubble-weather",
      width: 370 * scale,
      height: 370 * scale,
      x: width * layout.weather.x,
      y: height * layout.weather.y,
    },
    {
      id: "advice",
      className: "bubble-advice",
      width: 350 * scale,
      height: 350 * scale,
      x: width * layout.advice.x,
      y: height * layout.advice.y,
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
  const compact = width < 760;
  const [layout, setLayout] = useState<BubbleLayout>(() => getStoredLayout(window.innerWidth < 760));
  const dragStartLayoutRef = useRef<BubbleLayout | null>(null);
  const definitions = useMemo(() => getBubbleDefinitions(width, height, layout), [height, layout, width]);

  useEffect(() => {
    window.localStorage.setItem(layoutStorageKey, JSON.stringify(layout));
  }, [layout]);

  const resetLayout = () => setLayout(getDefaultLayout(compact));

  const handleBubbleDragEnd = (definition: BubbleDefinition, offset: { x: number; y: number }) => {
    const startLayout = dragStartLayoutRef.current ?? layout;
    const start = startLayout[definition.id];
    const frameMarginX = Math.max(28, width * 0.06);
    const frameMarginY = Math.max(24, height * 0.06);
    const minX = (definition.width / 2 + frameMarginX) / width;
    const maxX = 1 - minX;
    const minY = (definition.height / 2 + frameMarginY) / height;
    const maxY = 1 - minY;

    setLayout((current) => ({
      ...current,
      [definition.id]: {
        x: clamp(start.x + offset.x / width, minX, maxX),
        y: clamp(start.y + offset.y / height, minY, maxY),
      },
    }));
  };

  return (
    <main className="kiosk-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <section className="bubble-stage" aria-label="玄关天气信息">
        {definitions.map((definition) => {
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
                opacity: 1,
                scale: 1,
                x: definition.x - definition.width / 2,
                y: definition.y - definition.height / 2,
              }}
              className="bubble-anchor"
              drag
              dragMomentum={false}
              dragSnapToOrigin={false}
              initial={{ opacity: 0, scale: 0.88 }}
              key={definition.id}
              onDragEnd={(_, info) => handleBubbleDragEnd(definition, info.offset)}
              onDragStart={() => {
                dragStartLayoutRef.current = layout;
              }}
              style={{ width: definition.width, height: definition.height }}
              transition={{ type: "spring", stiffness: 120, damping: 24, mass: 0.7 }}
              whileDrag={{ scale: 1.03 }}
            >
              <div className={`info-bubble ${definition.className}`}>
                {content}
              </div>
            </motion.article>
          );
        })}
      </section>
      <button className="layout-reset" onClick={resetLayout} type="button">
        重置位置
      </button>
    </main>
  );
}

export default App;
