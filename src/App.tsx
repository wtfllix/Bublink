import { CloudSun, Droplets, Sun, ThermometerSun, Umbrella } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { departureAdvice, weatherSnapshot } from "./data/dashboard";

type BubbleId = "clock" | "weather" | "advice";

type BubbleDefinition = {
  id: BubbleId;
  className: string;
  width: number;
  height: number;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  driftRotate: number;
  duration: number;
  delay: number;
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
        x: width * 0.35,
        y: height * 0.22,
        driftX: 10 * scale,
        driftY: 8 * scale,
        driftRotate: 1.2,
        duration: 7.6,
        delay: -1.4,
      },
      {
        id: "weather",
        className: "bubble-weather",
        width: 285 * scale,
        height: 330 * scale,
        x: width * 0.62,
        y: height * 0.47,
        driftX: 12 * scale,
        driftY: 10 * scale,
        driftRotate: -1,
        duration: 8.4,
        delay: -3.1,
      },
      {
        id: "advice",
        className: "bubble-advice",
        width: Math.min(width * 0.86, 560 * scale),
        height: 185 * scale,
        x: width * 0.5,
        y: height * 0.78,
        driftX: 14 * scale,
        driftY: 7 * scale,
        driftRotate: 0.8,
        duration: 9.2,
        delay: -2.2,
      },
    ];
  }

  return [
    {
      id: "clock",
      className: "bubble-clock",
      width: 260 * scale,
      height: 160 * scale,
      x: width * 0.23,
      y: height * 0.25,
      driftX: 12 * scale,
      driftY: 9 * scale,
      driftRotate: 1.1,
      duration: 8,
      delay: -1.2,
    },
    {
      id: "weather",
      className: "bubble-weather",
      width: 320 * scale,
      height: 385 * scale,
      x: width * 0.52,
      y: height * 0.38,
      driftX: 14 * scale,
      driftY: 11 * scale,
      driftRotate: -0.9,
      duration: 8.8,
      delay: -3.4,
    },
    {
      id: "advice",
      className: "bubble-advice",
      width: 560 * scale,
      height: 210 * scale,
      x: width * 0.67,
      y: height * 0.72,
      driftX: 16 * scale,
      driftY: 8 * scale,
      driftRotate: 0.7,
      duration: 9.8,
      delay: -2.6,
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
  const definitions = useMemo(() => getBubbleDefinitions(width, height), [height, width]);

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
                x: [
                  definition.x - definition.width / 2 - definition.driftX,
                  definition.x - definition.width / 2 + definition.driftX,
                  definition.x - definition.width / 2 - definition.driftX,
                ],
                y: [
                  definition.y - definition.height / 2 + definition.driftY,
                  definition.y - definition.height / 2 - definition.driftY,
                  definition.y - definition.height / 2 + definition.driftY,
                ],
                rotate: [-definition.driftRotate, definition.driftRotate, -definition.driftRotate],
              }}
              className={`info-bubble ${definition.className}`}
              initial={{ opacity: 0, scale: 0.88 }}
              key={definition.id}
              style={{ width: definition.width, height: definition.height }}
              transition={{
                default: {
                  duration: definition.duration,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: definition.delay,
                },
                opacity: { duration: 0.45, ease: "easeOut" },
                scale: { duration: 0.45, ease: "easeOut" },
              }}
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
