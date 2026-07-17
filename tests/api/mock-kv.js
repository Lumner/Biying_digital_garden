export class MemoryKV {
  constructor(entries = {}) {
    this.values = new Map(
      Object.entries(entries).map(([key, value]) => [
        key,
        typeof value === "string" ? value : JSON.stringify(value)
      ])
    );
  }

  async get(key, options = {}) {
    if (!this.values.has(key)) return null;
    const value = this.values.get(key);
    if (options.type === "json") return JSON.parse(value);
    return value;
  }

  async put(key, value) {
    this.values.set(key, typeof value === "string" ? value : String(value));
  }

  async delete(key) {
    this.values.delete(key);
  }

  async list(options = {}) {
    const prefix = String(options.prefix || "");
    const limit = Math.max(1, Number(options.limit) || 1000);
    const offset = Math.max(0, Number(options.cursor) || 0);
    const all = [...this.values.keys()]
      .filter((key) => key.startsWith(prefix))
      .sort();
    const selected = all.slice(offset, offset + limit);
    const nextOffset = offset + selected.length;
    return {
      keys: selected.map((key) => ({ key })),
      cursor: nextOffset < all.length ? String(nextOffset) : "",
      complete: nextOffset >= all.length
    };
  }

  keys(prefix = "") {
    return [...this.values.keys()].filter((key) => key.startsWith(prefix)).sort();
  }
}
