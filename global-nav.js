(function initGlobalNav() {
  if (document.querySelector(".global-site-header")) return;

  const path = window.location.pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "") || "/";
  const isHomePath = path === "/";
  const WEATHER_EFFECTS_ENABLED = false;
  const projectPaths = [
    "/project",
    "/font-runner",
    "/much-project",
    "/tourdefrance",
    "/motelindustry-website",
    "/memoryofaflower",
    "/ekko-website",
    "/yocho",
    "/pasnormalstudios_FD",
    "/berries-n-dairies",
    "/domingo"
  ];
  const isProjectPath = projectPaths.some((projectPath) => path === projectPath || path.startsWith(`${projectPath}/`));
  const isActive = (href) => {
    if (href === "/") return path === "/";
    if (href === "/project/") return isProjectPath;
    return path === href.replace(/\/+$/, "") || path.startsWith(href);
  };

  const header = document.createElement("header");
  header.className = "global-site-header";
  header.setAttribute("aria-label", "Site header");
  header.innerHTML = `
    <div class="global-site-header__cell global-site-header__contact">
      <a class="global-instagram-link" href="https://instagram.com/niklastsalkos" target="_blank" rel="noopener">@niklastsalkos<span class="contact-hover-icon" aria-hidden="true"><svg viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect class="icon-fill" x="3" y="3" width="18" height="18" rx="5"></rect><circle class="icon-line" cx="12" cy="12" r="4"></circle><circle class="icon-dot" cx="17.5" cy="6.5" r="1"></circle></svg></span></a>
      <span aria-hidden="true"> / </span>
      <a class="global-email-link" href="mailto:nikl2229us@gmail.com">nikl2229us@gmail.com<span class="contact-hover-icon" aria-hidden="true"><svg viewBox="0 0 24 24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect class="icon-fill" x="3" y="5" width="18" height="14" rx="2"></rect><path class="icon-line" d="m3 7 9 6 9-6"></path></svg></span></a>
    </div>
    <nav class="global-site-header__cell global-site-header__nav" aria-label="Primary navigation">
      <a href="/" ${isActive("/") ? 'class="is-active" aria-current="page"' : ""}>About</a>
      <a href="/project/" ${isActive("/project/") ? 'class="is-active" aria-current="page"' : ""}>Projects</a>
      <a href="/experimental/" ${isActive("/experimental/") ? 'class="is-active" aria-current="page"' : ""}>Experimental</a>
    </nav>
    <div class="global-site-header__cell global-site-header__data" aria-label="Local information">
      <span class="global-weather-line" data-weather="unknown" aria-label="Local time and current weather">
        <span class="global-location-full">Denmark, Copenhagen</span><span class="global-location-short">CPH</span>
        <span class="global-clock">--:--</span>
        <span class="global-weather">
          <span class="global-weather-temp">--&deg;C</span>
          <span class="global-weather-condition">--</span>
        </span>
        <span class="global-weather-clouds" aria-hidden="true"></span>
        <canvas class="global-weather-canvas" aria-hidden="true"></canvas>
      </span>
      ${isHomePath ? '<button class="global-title-toggle" type="button" aria-label="Toggle profile text" aria-pressed="false"><span>Info</span><svg viewBox="0 0 12 12" aria-hidden="true"><path class="toggle-arrow" d="M3.5 3.5 8.5 8.5M8.5 4.5v4h-4"></path></svg></button>' : ''}
    </div>
  `;

  document.body.prepend(header);
  document.body.classList.add("global-nav-ready");
  if (isHomePath) {
    document.body.classList.add("home-page");
  }
  document.body.classList.toggle("weather-effects-enabled", WEATHER_EFFECTS_ENABLED);

  const clock = header.querySelector(".global-clock");
  const weatherLine = header.querySelector(".global-weather-line");
  const weatherTemp = header.querySelector(".global-weather-temp");
  const weatherCondition = header.querySelector(".global-weather-condition");
  const weatherClouds = header.querySelector(".global-weather-clouds");
  const weatherCanvas = header.querySelector(".global-weather-canvas");
  let lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const weatherContext = weatherCanvas.getContext("2d");
  const weatherParticles = [];
  let weatherFrame = 0;
  let weatherActive = false;
  let weatherDraining = false;
  let lightningAt = 0;

  const cloudParticles = Array.from({ length: 9 }, () => {
    const cloud = document.createElement("span");
    cloud.textContent = "☁︎";
    weatherClouds.append(cloud);
    return cloud;
  });

  function randomizeClouds() {
    cloudParticles.forEach((cloud, index) => {
      cloud.style.setProperty("--cloud-x", `${4 + Math.random() * 90}%`);
      cloud.style.setProperty("--cloud-y", `${-4 + Math.random() * 12}px`);
      cloud.style.setProperty("--cloud-size", `${16 + Math.random() * 12}px`);
      cloud.style.setProperty("--cloud-opacity", `${0.35 + Math.random() * 0.55}`);
      cloud.style.setProperty("--cloud-drift", `${-7 + Math.random() * 14}px`);
      cloud.style.setProperty("--cloud-duration", `${1.5 + Math.random() * 2.2}s`);
      cloud.style.setProperty("--cloud-delay", `${-index * 0.31 - Math.random()}s`);
      cloud.style.setProperty("--cloud-enter-delay", `${index * 0.045 + Math.random() * 0.12}s`);
    });
  }

  function resetWeatherParticles() {
    weatherParticles.length = 0;
    const mode = weatherLine.dataset.weather;
    const amount = mode === "rain" ? 58 : mode === "snow" ? 30 : mode.includes("cloudy") ? 9 : mode === "fog" ? 7 : 18;
    for (let index = 0; index < amount; index += 1) {
      weatherParticles.push({
        x: Math.random(), y: Math.random(), size: 0.5 + Math.random() * 1.5,
        speed: 0.15 + Math.random() * 0.45, drift: -0.25 + Math.random() * 0.5,
        alpha: 0.25 + Math.random() * 0.6, phase: Math.random() * Math.PI * 2,
        landed: false, exited: false, splash: 0, fade: 1, fadeRate: 0
      });
    }
    lightningAt = performance.now() + 500 + Math.random() * 1200;
  }

  function drawCloud(ctx, x, y, size, alpha, color) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.filter = `blur(${Math.max(.25, size * .035)}px)`;
    ctx.beginPath();
    ctx.arc(x - size * .34, y, size * .26, 0, Math.PI * 2);
    ctx.arc(x, y - size * .14, size * .38, 0, Math.PI * 2);
    ctx.arc(x + size * .38, y, size * .29, 0, Math.PI * 2);
    ctx.roundRect(x - size * .62, y, size * 1.24, size * .32, size * .14);
    ctx.fill();
    ctx.restore();
  }

  function renderWeather(now) {
    if (!weatherActive) return;
    const rect = weatherLine.getBoundingClientRect();
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.ceil(rect.width + 60);
    const height = 76;
    if (weatherCanvas.width !== width * ratio || weatherCanvas.height !== height * ratio) {
      weatherCanvas.width = width * ratio;
      weatherCanvas.height = height * ratio;
      weatherContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    weatherContext.clearRect(0, 0, width, height);
    const color = getComputedStyle(weatherLine).color;
    const mode = weatherLine.dataset.weather;

    weatherParticles.forEach((particle, index) => {
      const isFallingRain = mode === "rain" || mode === "thunder";
      if (!particle.landed && !particle.exited) {
        const fallRate = isFallingRain ? .085 : mode === "snow" && weatherDraining ? 0 : .012;
        particle.y += particle.speed * fallRate;
        particle.x += particle.drift * .0008;
        if (mode === "snow" && weatherDraining) {
          particle.fade = Math.max(0, particle.fade - particle.fadeRate);
          if (particle.fade === 0) particle.exited = true;
        }
      }
      if (isFallingRain && particle.y > 1.05) {
        particle.splash = 1;
        particle.splashX = 20 + particle.x * (width - 40);
        if (weatherDraining) {
          particle.y = 1.05;
          particle.landed = true;
        } else {
          particle.y = -.15;
        }
      } else if (particle.y > 1.15) {
        if (weatherDraining && mode === "snow") {
          particle.y = 1.15;
        } else {
          particle.y = -.15;
        }
      }
      if (particle.x > 1.1) particle.x = -.1;
      if (particle.x < -.1) particle.x = 1.1;
      const x = 20 + particle.x * (width - 40);
      const y = isFallingRain
        ? 24 + particle.y * 42
        : particle.y * height;
      weatherContext.strokeStyle = color;
      weatherContext.fillStyle = color;
      weatherContext.globalAlpha = particle.alpha;

      if (isFallingRain) {
        if (particle.splash > 0) {
          const splashProgress = 1 - particle.splash;
          weatherContext.globalAlpha = particle.alpha * particle.splash;
          weatherContext.lineWidth = .45;
          weatherContext.beginPath();
          weatherContext.ellipse(particle.splashX, 70, 1 + splashProgress * 4, .7 + splashProgress, 0, 0, Math.PI * 2);
          weatherContext.stroke();
          weatherContext.beginPath();
          weatherContext.moveTo(particle.splashX - 1, 69);
          weatherContext.lineTo(particle.splashX - 2.5, 66 + splashProgress * 2);
          weatherContext.moveTo(particle.splashX + 1, 69);
          weatherContext.lineTo(particle.splashX + 2.5, 66 + splashProgress * 2);
          weatherContext.stroke();
          particle.splash -= .09;
        }
        if (!particle.landed) {
          weatherContext.globalAlpha = particle.alpha;
          weatherContext.lineWidth = Math.max(.35, particle.size * .3);
          weatherContext.beginPath();
          weatherContext.moveTo(x, y);
          weatherContext.lineTo(x - 1.5, y + 3 + particle.size * 2);
          weatherContext.stroke();
        }
      } else if (mode === "snow") {
        if (!particle.exited) {
          const sway = Math.sin(now * .0015 + particle.phase) * 5;
          weatherContext.globalAlpha = particle.alpha * particle.fade;
          weatherContext.beginPath();
          weatherContext.arc(x + sway, y, particle.size * 1.35, 0, Math.PI * 2);
          weatherContext.fill();
        }
      } else if (mode === "cloudy" || mode === "partly-cloudy") {
        const cloudSize = 13 + particle.size * 9;
        drawCloud(weatherContext, x + Math.sin(now * .0004 + particle.phase) * 8, 27 + (index % 3) * 9, cloudSize, particle.alpha, color);
      } else if (mode === "fog") {
        weatherContext.lineWidth = 2 + particle.size;
        weatherContext.beginPath();
        const fogY = 18 + (index % 7) * 7;
        weatherContext.moveTo(x - 22, fogY);
        weatherContext.bezierCurveTo(x - 8, fogY - 3, x + 8, fogY + 3, x + 24, fogY);
        weatherContext.stroke();
      } else if (mode === "clear") {
        const angle = particle.phase + now * .00015;
        const cx = width * .5;
        const cy = height * .5;
        weatherContext.lineWidth = .8;
        weatherContext.beginPath();
        weatherContext.moveTo(cx + Math.cos(angle) * 16, cy + Math.sin(angle) * 8);
        weatherContext.lineTo(cx + Math.cos(angle) * 34, cy + Math.sin(angle) * 17);
        weatherContext.stroke();
      }
    });

    if (mode === "thunder" && now >= lightningAt) {
      weatherContext.globalAlpha = .9;
      weatherContext.lineWidth = 2;
      weatherContext.beginPath();
      const x = width * (.25 + Math.random() * .5);
      weatherContext.moveTo(x, 5);
      weatherContext.lineTo(x - 5, 24);
      weatherContext.lineTo(x + 2, 24);
      weatherContext.lineTo(x - 7, 48);
      weatherContext.stroke();
      lightningAt = now + 900 + Math.random() * 1700;
    }
    weatherContext.globalAlpha = 1;

    const rainHasDrained = (mode === "rain" || mode === "thunder")
      && weatherParticles.every((particle) => particle.landed && particle.splash <= 0);
    const snowHasDrained = mode === "snow" && weatherParticles.every((particle) => particle.fade <= 0);
    if (weatherDraining && (rainHasDrained || snowHasDrained)) {
      finishWeatherEffect();
      return;
    }

    weatherFrame = requestAnimationFrame(renderWeather);
  }

  function finishWeatherEffect() {
    weatherActive = false;
    weatherDraining = false;
    weatherCanvas.classList.remove("is-active");
    window.setTimeout(() => {
      if (!weatherActive) weatherContext.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
    }, 360);
  }

  function startWeatherEffect() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const isCloudMode = weatherLine.dataset.weather === "cloudy" || weatherLine.dataset.weather === "partly-cloudy";
    weatherClouds.classList.toggle("is-active", isCloudMode);
    if (isCloudMode) {
      randomizeClouds();
      weatherCanvas.classList.remove("is-active");
      weatherActive = false;
      cancelAnimationFrame(weatherFrame);
      return;
    }
    resetWeatherParticles();
    weatherActive = true;
    weatherDraining = false;
    weatherCanvas.classList.add("is-active");
    cancelAnimationFrame(weatherFrame);
    weatherFrame = requestAnimationFrame(renderWeather);
  }

  function stopWeatherEffect() {
    weatherClouds.classList.remove("is-active");
    if (weatherActive && ["rain", "thunder", "snow"].includes(weatherLine.dataset.weather)) {
      weatherDraining = true;
      if (weatherLine.dataset.weather === "snow") {
        weatherParticles.forEach((particle) => {
          particle.fadeRate = 0.008 + Math.random() * 0.012;
        });
      }
      return;
    }
    finishWeatherEffect();
  }

  const weatherPreviewModes = ["cloudy", "partly-cloudy", "rain", "snow", "fog", "thunder", "clear"];

  function cycleWeatherPreview() {
    const currentIndex = weatherPreviewModes.indexOf(weatherLine.dataset.weather);
    weatherLine.dataset.weather = weatherPreviewModes[(currentIndex + 1) % weatherPreviewModes.length];
    startWeatherEffect();
  }

  if (WEATHER_EFFECTS_ENABLED) {
    weatherLine.tabIndex = 0;
    weatherLine.setAttribute("role", "button");
    weatherLine.addEventListener("pointerenter", startWeatherEffect);
    weatherLine.addEventListener("pointerleave", stopWeatherEffect);
    weatherLine.addEventListener("focus", startWeatherEffect);
    weatherLine.addEventListener("blur", stopWeatherEffect);
    weatherLine.addEventListener("click", cycleWeatherPreview);
    weatherLine.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        cycleWeatherPreview();
      }
    });
  }

  function updateClock() {
    clock.textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Copenhagen",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short"
    }).format(new Date());
  }

  function weatherCodeLabel(code) {
    if (code === 0) return "clear";
    if ([1, 2].includes(code)) return "partly cloudy";
    if (code === 3) return "cloudy";
    if ([45, 48].includes(code)) return "fog";
    if ([51, 53, 55].includes(code)) return "drizzle";
    if ([61, 63, 65].includes(code)) return code === 61 ? "slight rain" : "rain";
    if ([71, 73, 75].includes(code)) return code === 71 ? "slight snow" : "snow";
    if ([80, 81, 82].includes(code)) return code === 80 ? "rain showers" : "heavy showers";
    if ([95, 96, 99].includes(code)) return "thunderstorm";
    return "--";
  }

  function weatherKind(code, condition = "") {
    if (code === 0 || condition === "clear") return "clear";
    if ([1, 2].includes(code) || condition === "partly cloudy") return "partly-cloudy";
    if (code === 3 || condition === "cloudy") return "cloudy";
    if ([45, 48].includes(code) || condition === "fog") return "fog";
    if ([71, 73, 75, 77, 85, 86].includes(code) || condition.includes("snow")) return "snow";
    if ([95, 96, 99].includes(code) || condition === "thunderstorm") return "thunder";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)
      || condition.includes("rain") || condition.includes("drizzle") || condition.includes("shower")) return "rain";
    return "unknown";
  }

  function applyWeather(tempText, conditionText, code) {
    weatherTemp.textContent = tempText;
    weatherCondition.textContent = conditionText;
    weatherLine.dataset.weather = weatherKind(code, conditionText);
    const previewHint = WEATHER_EFFECTS_ENABLED ? ". Click to preview weather effects." : "";
    weatherLine.setAttribute("aria-label", `Denmark, Copenhagen, ${clock.textContent}, ${tempText}, ${conditionText}${previewHint}`);
  }

  function readCachedWeather() {
    try {
      const cached = JSON.parse(localStorage.getItem("niklasSiteWeather") || "null");
      if (!cached || Date.now() - cached.timestamp > 30 * 60 * 1000) return false;
      applyWeather(cached.temp || "--\u00b0C", cached.condition || "--", cached.code);
      return true;
    } catch (_) {
      return false;
    }
  }

  async function updateWeather() {
    try {
      const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=55.6761&longitude=12.5683&current=temperature_2m,weather_code&timezone=Europe%2FCopenhagen", { cache: "no-store" });
      if (!response.ok) throw new Error("Weather request failed");
      const data = await response.json();
      const temperature = data.current?.temperature_2m;
      const unit = data.current_units?.temperature_2m || "\u00b0C";
      const tempText = typeof temperature === "number" ? `${Math.round(temperature)}${unit}` : "--\u00b0C";
      const conditionText = weatherCodeLabel(data.current?.weather_code);
      applyWeather(tempText, conditionText, data.current?.weather_code);
      try {
        localStorage.setItem("niklasSiteWeather", JSON.stringify({
          temp: tempText,
          condition: conditionText,
          code: data.current?.weather_code,
          timestamp: Date.now()
        }));
      } catch (_) {}
    } catch (_) {
      if (!readCachedWeather()) {
        applyWeather("--\u00b0C", "--");
      }
    }
  }

  updateClock();
  window.setInterval(updateClock, 1000);
  readCachedWeather();
  updateWeather();
  window.setInterval(updateWeather, 10 * 60 * 1000);

  window.addEventListener("scroll", () => {
    const currentY = window.scrollY || document.documentElement.scrollTop || 0;
    const delta = currentY - lastScrollY;

    if (currentY < 20 || delta < -5) {
      document.body.classList.remove("nav-hidden");
    } else if (delta > 5) {
      document.body.classList.add("nav-hidden");
    }

    lastScrollY = currentY;
  }, { passive: true });
})();
