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
    dawn: "linear-gradient(135deg, #FFF0DB 0%, #FFD4A8 25%, #FFAB76 55%, #FF8A65 100%)",
    day: "linear-gradient(135deg, #FFF8F0 0%, #FFE8CC 30%, #FFDDB0 60%, #E3F2FD 100%)",
    dusk: "linear-gradient(135deg, #FFF0DB 0%, #FFCC80 30%, #FF8A65 60%, #E1BEE7 100%)",
    night: "linear-gradient(135deg, #F5EBE0 0%, #EFCFB0 30%, #E0C4A8 60%, #D7CCC8 100%)",
  },
  cloudy: {
    dawn: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 30%, #E0D5C8 60%, #D7CCC8 100%)",
    day: "linear-gradient(135deg, #FAFAFA 0%, #F0EAE0 30%, #E8DDD0 60%, #D7CCC8 100%)",
    dusk: "linear-gradient(135deg, #FFF0DB 0%, #E8D5C4 30%, #D7B8A0 60%, #BCAAA4 100%)",
    night: "linear-gradient(135deg, #EFEBE9 0%, #E0D5C8 30%, #D7CCC8 60%, #BCAAA4 100%)",
  },
  rain: {
    dawn: "linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 30%, #B0BEC5 60%, #90A4AE 100%)",
    day: "linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 30%, #B0BEC5 60%, #90A4AE 100%)",
    dusk: "linear-gradient(135deg, #EFEBE9 0%, #D7CCC8 30%, #BCAAA4 60%, #A1887F 100%)",
    night: "linear-gradient(135deg, #E0D5C8 0%, #D7CCC8 30%, #BCAAA4 60%, #A1887F 100%)",
  },
  snow: {
    dawn: "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 30%, #E8EAF6 60%, #BBDEFB 100%)",
    day: "linear-gradient(135deg, #FFFFFF 0%, #F3E5F5 30%, #E8EAF6 60%, #E1F5FE 100%)",
    dusk: "linear-gradient(135deg, #FCE4EC 0%, #F3E5F5 30%, #E1BEE7 60%, #CE93D8 100%)",
    night: "linear-gradient(135deg, #EDE7F6 0%, #D1C4E9 30%, #B39DDB 60%, #9575CD 100%)",
  },
  storm: {
    dawn: "linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 30%, #B0BEC5 60%, #78909C 100%)",
    day: "linear-gradient(135deg, #CFD8DC 0%, #B0BEC5 30%, #90A4AE 60%, #78909C 100%)",
    dusk: "linear-gradient(135deg, #D7CCC8 0%, #BCAAA4 30%, #A1887F 60%, #8D6E63 100%)",
    night: "linear-gradient(135deg, #D7CCC8 0%, #BCAAA4 30%, #A1887F 60%, #795548 100%)",
  },
  fog: {
    dawn: "linear-gradient(135deg, #FFF8E1 0%, #FFF3E0 30%, #EFEBE9 60%, #D7CCC8 100%)",
    day: "linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 30%, #EEEEEE 60%, #E0E0E0 100%)",
    dusk: "linear-gradient(135deg, #EFEBE9 0%, #D7CCC8 30%, #BCAAA4 60%, #A1887F 100%)",
    night: "linear-gradient(135deg, #EFEBE9 0%, #E0D5C8 30%, #D7CCC8 60%, #BCAAA4 100%)",
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
    const colors = ["#FFB74D", "#F48FB1", "#81D4FA", "#FFCC80", "#A5D6A7", "#CE93D8", "#80DEEA"];
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
