(function () {
  const endpoint = "/api/stats";
  const visitorKey = "biying_site_visitor_id";

  function locale() {
    return window.location.pathname.startsWith("/en/") ? "en" : "zh";
  }

  function copy(key) {
    const zh = locale() === "zh";
    return {
      loading: zh ? "正在读取站点统计" : "Loading site statistics",
      ready: zh ? "统计已更新" : "Stats updated",
      unavailable: zh ? "统计服务暂不可用，线上绑定 KV 后会自动生效。" : "Stats are unavailable until KV is configured on the live site."
    }[key];
  }

  function formatNumber(value) {
    return new Intl.NumberFormat(locale() === "zh" ? "zh-CN" : "en-US").format(Math.max(0, Number(value) || 0));
  }

  function randomId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  }

  function visitorId() {
    try {
      const existing = localStorage.getItem(visitorKey);
      if (existing) return existing;
      const id = randomId();
      localStorage.setItem(visitorKey, id);
      return id;
    } catch (error) {
      return randomId();
    }
  }

  function roots() {
    return Array.from(document.querySelectorAll("[data-site-stats]"));
  }

  function setStatus(message) {
    document.querySelectorAll("[data-site-stat-status]").forEach((node) => {
      node.textContent = message;
    });
  }

  function render(data) {
    document.querySelectorAll("[data-site-stat='totalVisitors']").forEach((node) => {
      node.textContent = formatNumber(data.totalVisitors);
    });
    document.querySelectorAll("[data-site-stat='pageViews']").forEach((node) => {
      node.textContent = formatNumber(data.pageViews);
    });
  }

  async function requestStats(method, body) {
    const init = {
      method,
      cache: "no-store",
      headers: { "content-type": "application/json" }
    };
    if (body) init.body = JSON.stringify(body);
    const response = await fetch(endpoint, init);
    const data = await response.json().catch(() => ({}));
    if (!response.ok && !data.available) throw new Error(data.error || "stats_unavailable");
    return data;
  }

  async function loadStats() {
    const visible = roots().length > 0;
    if (visible) setStatus(copy("loading"));

    try {
      const data = await requestStats("POST", {
        visitorId: visitorId(),
        path: window.location.pathname,
        locale: locale()
      });
      render(data);
      if (visible) setStatus(data.available === false ? copy("unavailable") : copy("ready"));
    } catch (error) {
      try {
        const data = await requestStats("GET");
        render(data);
        if (visible) setStatus(data.available === false ? copy("unavailable") : copy("ready"));
      } catch (fallbackError) {
        render({ totalVisitors: 0, pageViews: 0 });
        if (visible) setStatus(copy("unavailable"));
      }
    }
  }

  document.addEventListener("DOMContentLoaded", loadStats);
})();
