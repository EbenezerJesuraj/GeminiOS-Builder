import { useEffect, useState, useMemo, useRef, useCallback } from "react";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

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

  // Live canvas animation — aurora waves, bokeh, light rays
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const t = Date.now() * 0.001;

    ctx.clearRect(0, 0, W, H);

    // Aurora wave layers
    const auroraColors = [
      "rgba(255,183,77,0.06)",   // amber
      "rgba(244,143,177,0.05)",  // pink
      "rgba(129,212,250,0.05)",  // blue
      "rgba(206,147,216,0.04)",  // purple
      "rgba(165,214,167,0.04)",  // green
    ];
    for (let layer = 0; layer < auroraColors.length; layer++) {
      ctx.beginPath();
      ctx.moveTo(0, H);
      const speed = 0.3 + layer * 0.15;
      const amp = 60 + layer * 25;
      const yBase = H * (0.25 + layer * 0.12);
      for (let x = 0; x <= W; x += 4) {
        const y = yBase
          + Math.sin(x * 0.003 + t * speed) * amp
          + Math.sin(x * 0.007 - t * speed * 0.7) * (amp * 0.5)
          + Math.cos(x * 0.002 + t * speed * 0.4) * (amp * 0.3);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = auroraColors[layer];
      ctx.fill();
    }

    // Light rays from top-right
    const rayCount = 6;
    for (let i = 0; i < rayCount; i++) {
      const angle = -0.3 + i * 0.12 + Math.sin(t * 0.2 + i) * 0.05;
      const rayLen = H * 1.5;
      const originX = W * 0.85;
      const originY = -H * 0.1;
      const spread = 0.04 + Math.sin(t * 0.3 + i * 2) * 0.015;

      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.lineTo(
        originX + Math.cos(angle - spread) * rayLen,
        originY + Math.sin(angle - spread) * rayLen
      );
      ctx.lineTo(
        originX + Math.cos(angle + spread) * rayLen,
        originY + Math.sin(angle + spread) * rayLen
      );
      ctx.closePath();
      const rayOpacity = 0.015 + Math.sin(t * 0.5 + i * 1.5) * 0.008;
      ctx.fillStyle = `rgba(255,220,160,${rayOpacity})`;
      ctx.fill();
    }

    // Floating bokeh circles
    for (let i = 0; i < 18; i++) {
      const bx = (Math.sin(t * 0.15 + i * 1.7) * 0.3 + 0.5 + i * 0.05) * W % W;
      const by = (Math.cos(t * 0.12 + i * 2.3) * 0.3 + 0.5 + i * 0.04) * H % H;
      const bSize = 30 + Math.sin(t * 0.4 + i) * 15 + i * 4;
      const bOpacity = 0.02 + Math.sin(t * 0.3 + i * 0.8) * 0.012;

      const bokehColors = [
        `rgba(255,183,77,${bOpacity})`,
        `rgba(244,143,177,${bOpacity})`,
        `rgba(129,212,250,${bOpacity})`,
        `rgba(255,204,128,${bOpacity})`,
        `rgba(206,147,216,${bOpacity})`,
        `rgba(165,214,167,${bOpacity})`,
      ];

      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, bSize);
      grad.addColorStop(0, bokehColors[i % bokehColors.length]);
      grad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(bx, by, bSize, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Subtle flowing noise dots (firefly-like)
    for (let i = 0; i < 40; i++) {
      const fx = (Math.sin(t * 0.08 + i * 3.14) * 0.4 + 0.5 + Math.cos(i * 7.7) * 0.4) * W % W;
      const fy = (Math.cos(t * 0.06 + i * 2.71) * 0.4 + 0.5 + Math.sin(i * 5.5) * 0.3) * H % H;
      const fOpacity = 0.08 + Math.sin(t * 0.7 + i * 1.2) * 0.06;
      const fSize = 1.5 + Math.sin(t * 0.5 + i) * 0.8;

      ctx.beginPath();
      ctx.arc(fx, fy, fSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,160,100,${fOpacity})`;
      ctx.fill();
    }

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Weather particles (rain/snow)
  const weatherParticles = useMemo(() => {
    if (weather.condition === "rain") {
      return Array.from({ length: 60 }, () => ({
        x: Math.random() * 100,
        duration: 0.6 + Math.random() * 0.6,
        delay: Math.random() * 2,
      }));
    }
    if (weather.condition === "snow") {
      return Array.from({ length: 40 }, () => ({
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

        {/* Live canvas — aurora waves, light rays, bokeh, fireflies */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />

        {/* CSS animated mesh overlay */}
        <div className="wallpaper-mesh" />

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
