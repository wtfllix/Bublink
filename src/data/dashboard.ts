export type WeatherSnapshot = {
  condition: string;
  temperature: number;
  high: number;
  low: number;
  rainChance: number;
  humidity: number;
  uv: string;
};

export type AdviceTag = {
  label: string;
};

export type DepartureAdvice = {
  headline: string;
  detail: string;
  tags: AdviceTag[];
};

export const weatherSnapshot: WeatherSnapshot = {
  condition: "晴间多云",
  temperature: 24,
  high: 29,
  low: 18,
  rainChance: 18,
  humidity: 52,
  uv: "中等",
};

export const departureAdvice: DepartureAdvice = {
  headline: "早上阳光不错，午后云会多一些。",
  detail: "薄外套可以留在包里，伞今天不是必需品。",
  tags: [{ label: "适合步行" }, { label: "无需带伞" }, { label: "早晚微凉" }],
};
