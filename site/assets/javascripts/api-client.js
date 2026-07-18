(function () {
  class BiyingApiError extends Error {
    constructor(message, options = {}) {
      super(message);
      this.name = "BiyingApiError";
      this.code = options.code || message;
      this.status = options.status || 0;
      this.detail = options.detail || "";
      this.data = options.data || {};
    }
  }

  async function parseResponse(response) {
    const type = response.headers.get("content-type") || "";
    const data = type.includes("application/json")
      ? await response.json().catch(() => ({}))
      : { detail: await response.text().catch(() => "") };
    if (!response.ok) {
      throw new BiyingApiError(data.error || "request_failed", {
        code: response.status === 404 ? "api_not_found" : data.error,
        status: response.status,
        detail: data.detail || "",
        data
      });
    }
    return data;
  }

  async function request(url, options = {}) {
    const headers = { ...(options.headers || {}) };
    const init = { credentials: "same-origin", ...options, headers };
    if (options.json !== undefined) {
      headers["content-type"] = headers["content-type"] || "application/json";
      init.body = JSON.stringify(options.json);
      delete init.json;
    }
    try {
      return await parseResponse(await fetch(url, init));
    } catch (error) {
      if (error instanceof BiyingApiError) throw error;
      throw new BiyingApiError("fetch_failed", { code: "fetch_failed" });
    }
  }

  function errorCode(error) {
    if (!error) return "unknown_error";
    if (error.code) return error.code;
    if (error.status === 404) return "api_not_found";
    return "request_failed";
  }

  function friendlyError(error, messages, fallback) {
    return messages[errorCode(error)] || messages[String(error && error.status)] || fallback;
  }

  window.BiyingApi = {
    BiyingApiError,
    errorCode,
    friendlyError,
    parseResponse,
    request
  };
})();
