(function initGlobalNav() {
  if (document.querySelector(".global-site-header")) return;

  const path = window.location.pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "") || "/";
  const projectPaths = [
    "/project",
    "/font-runner",
    "/much-project",
    "/tourdefrance",
    "/motelindustry-website",
    "/memoryofaflower",
    "/Doomsday",
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
      <a class="global-instagram-link" href="https://instagram.com/niklastsalkos" target="_blank" rel="noopener">@niklastsalkos</a>
      <span aria-hidden="true"> / </span>
      <a class="global-email-link" href="mailto:nikl2229us@gmail.com">nikl2229us@gmail.com</a>
    </div>
    <nav class="global-site-header__cell global-site-header__nav" aria-label="Primary navigation">
      <a href="/" ${isActive("/") ? 'class="is-active" aria-current="page"' : ""}>About</a>
      <a href="/project/" ${isActive("/project/") ? 'class="is-active" aria-current="page"' : ""}>Projects</a>
      <a href="/experimental/" ${isActive("/experimental/") ? 'class="is-active" aria-current="page"' : ""}>Experimental</a>
    </nav>
    <div class="global-site-header__cell global-site-header__data" aria-label="Local information">
      <span class="global-location-full">Denmark, Copenhagen</span><span class="global-location-short">CPH</span>
      <span class="global-clock">--:--</span>
      <span class="global-weather-temp">--&deg;C</span>
      <span class="global-weather-condition">--</span>
    </div>
  `;

  document.body.prepend(header);
  document.body.classList.add("global-nav-ready");

  const clock = header.querySelector(".global-clock");
  const weatherTemp = header.querySelector(".global-weather-temp");
  const weatherCondition = header.querySelector(".global-weather-condition");
  let lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;

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

  function readCachedWeather() {
    try {
      const cached = JSON.parse(localStorage.getItem("niklasSiteWeather") || "null");
      if (!cached || Date.now() - cached.timestamp > 30 * 60 * 1000) return false;
      weatherTemp.textContent = cached.temp || "--\u00b0C";
      weatherCondition.textContent = cached.condition || "--";
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
      weatherTemp.textContent = tempText;
      weatherCondition.textContent = conditionText;
      try {
        localStorage.setItem("niklasSiteWeather", JSON.stringify({
          temp: tempText,
          condition: conditionText,
          timestamp: Date.now()
        }));
      } catch (_) {}
    } catch (_) {
      if (!readCachedWeather()) {
        weatherTemp.textContent = "--\u00b0C";
        weatherCondition.textContent = "--";
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
