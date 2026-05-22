import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WeatherState {
  condition: "clear" | "cloudy" | "rain" | "storm" | "snow" | "sunset";
  temp: number;
  time: "day" | "night" | "dawn" | "dusk";
}

const gradientMap: Record<string, string[]> = {
  "clear-day": ["#4285F4", "#87CEEB", "#E8F0FE"],
  "clear-night": ["#0d1b2a", "#1b2838", "#2c3e50"],
  "clear-dawn": ["#FBBC04", "#EA4335", "#4285F4"],
  "clear-dusk": ["#EA4335", "#9C27B0", "#1a1a2e"],
  "cloudy-day": ["#5F6368", "#9AA0A6", "#DADCE0"],
  "cloudy-night": ["#1a1a2e", "#2d2d44", "#3d3d5c"],
  "rain-day": ["#455A64", "#607D8B", "#78909C"],
  "rain-night": ["#1a1a2e", "#263238", "#37474F"],
  "storm-day": ["#37474F", "#263238", "#1C1C1C"],
  "storm-night": ["#0a0a0f", "#1a1a2e", "#2d2d3d"],
  "snow-day": ["#CFD8DC", "#ECEFF1", "#FFFFFF"],
  "snow-night": ["#2c3e50", "#34495e", "#5D6D7E"],
  "sunset-dusk": ["#FBBC04", "#EA4335", "#9C27B0"],
};

function getTimeOfDay(): WeatherState["time"] {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

function DynamicWallpaper() {
  const [weather, setWeather] = useState<WeatherState>({
    condition: "clear",
    temp: 22,
    time: getTimeOfDay(),
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=11.02&longitude=76.97&current_weather=true"
        );
        const data = await res.json();
        const code = data.current_weather?.weathercode ?? 0;
        const temp = data.current_weather?.temperature ?? 22;

        let condition: WeatherState["condition"] = "clear";
        if (code >= 1 && code <= 3) condition = "cloudy";
        else if (code >= 51 && code <= 67) condition = "rain";
        else if (code >= 71 && code <= 77) condition = "snow";
        else if (code >= 95) condition = "storm";

        setWeather({ condition, temp, time: getTimeOfDay() });
      } catch {
        setWeather((prev) => ({ ...prev, time: getTimeOfDay() }));
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // 10 min
    const timeInterval = setInterval(
      () => setWeather((prev) => ({ ...prev, time: getTimeOfDay() })),
      60000
    );
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const key = `${weather.condition}-${weather.time}`;
  const colors = gradientMap[key] ?? gradientMap["clear-day"];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        className="dynamic-wallpaper"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2 }}
      >
        <div
          className="wallpaper-gradient"
          style={{
            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
          }}
        />

        {/* Floating orbs for ambient effect */}
        <div className="wallpaper-orbs">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="wallpaper-orb"
              style={{
                background: `radial-gradient(circle, ${colors[i % colors.length]}44, transparent)`,
                width: `${150 + i * 80}px`,
                height: `${150 + i * 80}px`,
                left: `${10 + i * 15}%`,
                top: `${5 + (i % 3) * 30}%`,
              }}
              animate={{
                x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
                y: [0, 20 * (i % 2 === 0 ? -1 : 1), 0],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Weather particles */}
        {weather.condition === "rain" && (
          <div className="weather-rain">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="raindrop"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        {weather.condition === "snow" && (
          <div className="weather-snow">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="snowflake"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                  fontSize: `${8 + Math.random() * 10}px`,
                }}
              />
            ))}
          </div>
        )}

        {/* Temperature display */}
        <div className="wallpaper-weather-badge">
          <span className="weather-temp">{weather.temp}°</span>
          <span className="weather-condition">{weather.condition}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default DynamicWallpaper;
