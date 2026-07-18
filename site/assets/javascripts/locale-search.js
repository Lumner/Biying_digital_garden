(() => {
  const boundLists = new WeakSet();
  const boundQueries = new WeakSet();
  const nativeFetch = window.fetch.bind(window);
  const NativeXMLHttpRequest = window.XMLHttpRequest;
  const nativeResponseGetter = Object.getOwnPropertyDescriptor(
    NativeXMLHttpRequest.prototype,
    "response"
  )?.get;

  function locale() {
    return window.location.pathname.startsWith("/en/") ? "en" : "zh";
  }

  function belongsToLocale(link, currentLocale) {
    try {
      const path = new URL(link.href, window.location.href).pathname;
      return path.startsWith(`/${currentLocale}/`);
    } catch (error) {
      return false;
    }
  }

  function filterSearchPayload(payload) {
    const prefix = `${locale()}/`;
    payload.docs = Array.isArray(payload.docs)
      ? payload.docs.filter((document) => String(document.location || "").startsWith(prefix))
      : [];
    return payload;
  }

  window.fetch = async (...args) => {
    const response = await nativeFetch(...args);
    let requestUrl;
    try {
      const input = args[0];
      requestUrl = new URL(
        typeof input === "string" || input instanceof URL ? input : input.url,
        window.location.href
      );
    } catch (error) {
      return response;
    }
    if (!requestUrl.pathname.endsWith("/search/search_index.json") || !response.ok) {
      return response;
    }

    try {
      const payload = await response.clone().json();
      filterSearchPayload(payload);
      const headers = new Headers(response.headers);
      headers.set("content-type", "application/json; charset=utf-8");
      return new Response(JSON.stringify(payload), {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    } catch (error) {
      return response;
    }
  };

  class LocaleXMLHttpRequest extends NativeXMLHttpRequest {
    open(method, url, ...rest) {
      this.biyingSearchRequest = new URL(url, window.location.href).pathname
        .endsWith("/search/search_index.json");
      super.open(method, url, ...rest);
      if (!this.biyingSearchRequest) return;
      super.addEventListener("load", async (event) => {
        if (this.biyingFilteredResponseReady) return;
        event.stopImmediatePropagation();
        try {
          const response = nativeResponseGetter?.call(this);
          const payload = JSON.parse(await response.text());
          this.biyingFilteredResponse = new Blob(
            [JSON.stringify(filterSearchPayload(payload))],
            { type: "application/json" }
          );
        } catch (error) {
          this.biyingFilteredResponse = nativeResponseGetter?.call(this);
        }
        this.biyingFilteredResponseReady = true;
        this.dispatchEvent(new Event("load"));
      }, true);
    }

    get response() {
      if (this.biyingFilteredResponseReady) return this.biyingFilteredResponse;
      return nativeResponseGetter?.call(this) ?? null;
    }
  }

  window.XMLHttpRequest = LocaleXMLHttpRequest;

  function resultItems(list) {
    return [...list.children].filter((item) =>
      item.classList.contains("md-search-result__item")
    );
  }

  function updateLocaleNote(result, visibleCount, hasQuery, currentLocale) {
    let note = result.querySelector(".biying-search-locale-note");
    if (!note) {
      note = document.createElement("span");
      note.className = "biying-search-locale-note";
      note.setAttribute("aria-live", "polite");
      result.querySelector(".md-search-result__meta")?.insertAdjacentElement("afterend", note);
    }
    if (!hasQuery) {
      note.hidden = true;
      note.textContent = "";
      return;
    }
    note.hidden = false;
    note.textContent = currentLocale === "en"
      ? `${visibleCount} English result${visibleCount === 1 ? "" : "s"} shown`
      : `显示 ${visibleCount} 个中文结果`;
  }

  function filterSearchResults() {
    const result = document.querySelector('[data-md-component="search-result"]');
    const list = result?.querySelector(".md-search-result__list");
    if (!result || !list) return;

    const currentLocale = locale();
    const query = document.querySelector('[data-md-component="search-query"]');
    const items = resultItems(list);
    let visibleCount = 0;

    for (const item of items) {
      const links = [...item.querySelectorAll("a[href]")];
      const visible = links.some((link) => belongsToLocale(link, currentLocale));
      item.hidden = !visible;
      item.dataset.biyingSearchLocale = visible ? currentLocale : "other";
      if (visible) visibleCount += 1;
    }

    result.dataset.biyingSearchLocale = currentLocale;
    updateLocaleNote(result, visibleCount, Boolean(query?.value.trim()), currentLocale);
  }

  function bindSearch() {
    const list = document.querySelector(".md-search-result__list");
    const query = document.querySelector('[data-md-component="search-query"]');
    if (!list || !query) return;

    if (!boundLists.has(list)) {
      const observer = new MutationObserver(filterSearchResults);
      observer.observe(list, { childList: true, subtree: true });
      boundLists.add(list);
    }
    if (!boundQueries.has(query)) {
      query.addEventListener("input", () => queueMicrotask(filterSearchResults));
      query.form?.addEventListener("reset", () => queueMicrotask(filterSearchResults));
      boundQueries.add(query);
    }
    filterSearchResults();
  }

  if (window.document$?.subscribe) {
    window.document$.subscribe(bindSearch);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindSearch, { once: true });
  } else {
    bindSearch();
  }
})();
