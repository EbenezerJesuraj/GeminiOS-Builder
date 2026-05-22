import { useEffect, useState, useMemo } from "react";

interface WeatherData {
  temperature: number;
  weatherCode: number;
  condition: string;
}

const weatherEmojis: Record<string, string> = {
  clear: "☀️", cloudy: "☁️", rain: "🌧️", snow: "❄️", storm: "⛈️", fog: "🌫️",
};

function getTimeOfDay(): "dawn" | "day" | "dusk" | "night" {
  const h = new Date().getHours();
  if (h >= 5 && h < 7) return "dawn";
  if (h >= 7 && h < 17) return "day";
  if (h >= 17 && h < 20) return "dusk";
  return "night";
}

function codeToCondition(code: number): string {
  if (code <= 1) return "clear";
  if (code <= 3) return "cloudy";
  if (code <= 49) return "fog";
  if (code <= 69) return "rain";
  if (code <= 79) return "snow";
  if (code <= 99) return "storm";
  return "clear";
}

const gradientMap: Record<string, Record<string, string>> = {
  clear: {
    dawn: "linear-gradient(135deg, #1a1035 0%, #4a2068 25%, #e85d75 55%, #ffb347 100%)",
    day: "linear-gradient(135deg, #0a1628 0%, #1a3a6c 30%, #4285F4 60%, #87CEEB 100%)",
    dusk: "linear-gradient(135deg, #0d1b2a 0%, #3d1f54 30%, #e74c3c 60%, #f39c12 100%)",
    night: "linear-gradient(135deg, #030712 0%, #0a1628 30%, #1a1040 60%, #2d1b69 100%)",
  },
  cloudy: {
    dawn: "linear-gradient(135deg, #1a1035 0%, #3d2852 30%, #7b6b8a 60%, #b8a9c9 100%)",
    day: "linear-gradient(135deg, #1c2333 0%, #2d3748 30%, #4a5568 60%, #718096 100%)",
    dusk: "linear-gradient(135deg, #1a1035 0%, #3d2145 30%, #8b5a6b 60%, #c97b7b 100%)",
    night: "linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 30%, #2a2f3e 60%, #3a3f4e 100%)",
  },
  rain: {
    dawn: "linear-gradient(135deg, #0d1117 0%, #1a2332 30%, #2c3e50 60%, #546e7a 100%)",
    day: "linear-gradient(135deg, #0d1b2a 0%, #1b2838 30%, #2c3e50 60%, #4a6274 100%)",
    dusk: "linear-gradient(135deg, #0a0e1a 0%, #1a1f30 30%, #2d3040 60%, #4a4050 100%)",
    night: "linear-gradient(135deg, #050810 0%, #0d1117 30%, #1a1f2e 60%, #252a39 100%)",
  },
  snow: {
    dawn: "linear-gradient(135deg, #1a1f3a 0%, #3a3f6a 30%, #6a6f9a 60%, #b0b5d5 100%)",
    day: "linear-gradient(135deg, #1e2a40 0%, #344a68 30%, #5a7a9a 60%, #9abadc 100%)",
    dusk: "linear-gradient(135deg, #1a1530 0%, #2a2550 30%, #5a4580 60%, #8a75b0 100%)",
    night: "linear-gradient(135deg, #0a0e20 0%, #1a1e38 30%, #2a2e4a 60%, #3a3e5c 100%)",
  },
  storm: {
    dawn: "linear-gradient(135deg, #0a0a14 0%, #1a1a2e 30%, #2a1a3e 60%, #3a2a4e 100%)",
    day: "linear-gradient(135deg, #0d1117 0%, #1a1f2e 30%, #2a2535 60%, #3a3040 100%)",
    dusk: "linear-gradient(135deg, #0a080e 0%, #1a1520 30%, #2a1a30 60%, #3a2a38 100%)",
    night: "linear-gradient(135deg, #050508 0%, #0a0a14 30%, #141420 60%, #1e1e2c 100%)",
  },
  fog: {
    dawn: "linear-gradient(135deg, #1a1f30 0%, #2a3040 30%, #4a5060 60%, #7a8090 100%)",
    day: "linear-gradient(135deg, #1e2530 0%, #2e3540 30%, #4e5560 60%, #7e8590 100%)",
    dusk: "linear-gradient(135deg, #1a1520 0%, #2a2530 30%, #4a3540 60%, #6a5560 100%)",
    night: "linear-gradient(135deg, #0a0e14 0%, #141820 30%, #1e2228 60%, #282c34 100%)",
  },
};

function DynamicWallpaper() {
  const [weather, setWeather] = useState<WeatherData>({ temperature: 22, weatherCode: 0, condition: "clear" });
  const timeOfDay = getTimeOfDay();

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true"
        );
        const data = await res.json();
        const cw = data.current_weather;
        setWeather({
          temperature: Math.round(cw.temperature),
          weatherCode: cw.weathercode,
          condition: codeToCondition(cw.weathercode),
        });
      } catch {
        // keep defaults
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 300000);
    return () => clearInterval(interval);
  }, []);

  const gradient = gradientMap[weather.condition]?.[timeOfDay] ?? gradientMap.clear.night;
  const emoji = weatherEmojis[weather.condition] ?? "☀️";

  // 3D orbs with parallax depth
  const orbs = useMemo(() => {
    const colors = ["#4285F4", "#A142F4", "#EA4335", "#FBBC04", "#34A853", "#F439A0", "#00BCD4"];
    return Array.from({ length: 7 }, (_, i) => ({
      color: colors[i],
      size: 200 + Math.random() * 300,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 18 + Math.random() * 20,
      delay: i * 2.5,
      opacity: 0.12 + Math.random() * 0.12,
    }));
  }, []);

  // 3D particles
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      opacity: 0.15 + Math.random() * 0.35,
    })),
    []
  );

  // Weather particles
  const weatherParticles = useMemo(() => {
    if (weather.condition === "rain") {
      return Array.from({ length: 60 }, (_, i) => ({
        x: Math.random() * 100,
        duration: 0.6 + Math.random() * 0.6,
        delay: Math.random() * 2,
      }));
    }
    if (weather.condition === "snow") {
      return Array.from({ length: 40 }, (_, i) => ({
        x: Math.random() * 100,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * 5,
      }));
    }
    return [];
  }, [weather.condition]);

  return (
    <>
      <div className="dynamic-wallpaper">
        {/* Base gradient */}
        <div className="wallpaper-gradient" style={{ background: gradient }} />

        {/* Animated mesh */}
        <div className="wallpaper-mesh" />

        {/* 3D floating orbs */}
        <div className="wallpaper-orbs">
          {orbs.map((orb, i) => (
            <div
              key={i}
              className="wallpaper-orb"
              style={{
                width: orb.size,
                height: orb.size,
                left: `${orb.x}%`,
                top: `${orb.y}%`,
                background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
                opacity: orb.opacity,
                animation: `mesh-drift ${orb.duration}s ease-in-out ${orb.delay}s infinite alternate`,
              }}
            />
          ))}
        </div>

        {/* 3D particles */}
        <div className="wallpaper-particles">
          {particles.map((p, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${p.x}%`,
                width: p.size,
                height: p.size,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>

        {/* Weather effects */}
        {weather.condition === "rain" && (
          <div className="weather-rain">
            {weatherParticles.map((r, i) => (
              <div
                key={i}
                className="raindrop"
                style={{
                  left: `${r.x}%`,
                  animationDuration: `${r.duration}s`,
                  animationDelay: `${r.delay}s`,
                }}
              />
            ))}
          </div>
        )}

        {weather.condition === "snow" && (
          <div className="weather-snow">
            {weatherParticles.map((s, i) => (
              <div
                key={i}
                className="snowflake"
                style={{
                  left: `${s.x}%`,
                  animationDuration: `${s.duration}s`,
                  animationDelay: `${s.delay}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Weather badge */}
      <div className="wallpaper-weather-badge">
        <span className="weather-icon-3d" style={{ fontSize: 18 }}>{emoji}</span>
        <span className="weather-temp">{weather.temperature}°</span>
        <span className="weather-condition">{weather.condition}</span>
      </div>
    </>
  );
}

export default DynamicWallpaper;
