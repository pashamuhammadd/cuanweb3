import { XMLParser } from "fast-xml-parser";
import { fetchWithRetry } from "../http";
import { hashContent } from "../text";
import type { RawItem, SourceAdapter } from "../types";

const MAX_ITEMS = 40;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  processEntities: false,
  htmlEntities: false,
});

type Node = Record<string, unknown>;

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object" && "#text" in (value as Node)) return String((value as Node)["#text"] ?? "");
  return "";
}

function atomLink(entry: Node): string {
  const links = asArray(entry.link as Node | Node[] | string | undefined);
  for (const link of links) {
    if (typeof link === "string") return link;
    const rel = (link as Node)["@_rel"];
    if (!rel || rel === "alternate") return String((link as Node)["@_href"] ?? "");
  }
  return "";
}

/** Parse RSS 2.0 atau Atom menjadi RawItem. Diekspor untuk unit test. */
export function parseFeed(xml: string, organizer: string | null): RawItem[] {
  const doc = parser.parse(xml) as Node;

  const rss = doc.rss as Node | undefined;
  if (rss) {
    const channel = rss.channel as Node;
    return asArray(channel?.item as Node | Node[]).slice(0, MAX_ITEMS).map((item) => {
      const link = text(item.link).trim();
      const guid = text(item.guid).trim();
      const categories = asArray(item.category as unknown).map(text).filter(Boolean);
      return {
        externalId: guid || link || hashContent([text(item.title)]),
        title: text(item.title),
        url: link || guid,
        publishedAt: text(item.pubDate) || text(item["dc:date"]) || null,
        description: text(item["content:encoded"]) || text(item.description),
        organizer,
        tags: categories,
      } satisfies RawItem;
    });
  }

  const feed = doc.feed as Node | undefined;
  if (feed) {
    return asArray(feed.entry as Node | Node[]).slice(0, MAX_ITEMS).map((entry) => {
      const link = atomLink(entry);
      return {
        externalId: text(entry.id) || link,
        title: text(entry.title),
        url: link,
        publishedAt: text(entry.published) || text(entry.updated) || null,
        description: text(entry.content) || text(entry.summary),
        organizer,
        tags: [],
      } satisfies RawItem;
    });
  }

  throw new Error("Format feed tidak dikenali (bukan RSS/Atom).");
}

/** Organizer default = nama sumber tanpa keterangan dalam kurung/"Blog". */
export function organizerFromSourceName(name: string): string {
  return name.replace(/\s*\(.*?\)\s*/g, " ").replace(/\b(blog|news|feed)\b/gi, "").replace(/\s+/g, " ").trim() || name;
}

export const rssAdapter: SourceAdapter = {
  key: "rss",
  async fetchItems(source, ctx) {
    const headers: Record<string, string> = { Accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.5" };
    if (source.http_etag) headers["If-None-Match"] = source.http_etag;
    if (source.http_last_modified) headers["If-Modified-Since"] = source.http_last_modified;

    let requests = 0;
    const res = await fetchWithRetry(source.url, {
      headers,
      deadline: ctx.deadline,
      fetchImpl: ctx.fetchImpl,
      acceptStatus: [304],
      beforeRequest: async () => {
        requests++;
        await ctx.beforeRequest();
      },
    });

    if (res.status === 304) return { items: [], requests, notModified: true, etag: source.http_etag, lastModified: source.http_last_modified };

    const xml = await res.text();
    const organizer = source.kind === "rss" && source.keyword_filter ? organizerFromSourceName(source.name) : null;
    return {
      items: parseFeed(xml, organizer),
      requests,
      etag: res.headers.get("etag"),
      lastModified: res.headers.get("last-modified"),
    };
  },
};
