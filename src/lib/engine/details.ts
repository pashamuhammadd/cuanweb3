import type { DetailKey } from "@/lib/category-specs";
import type { OpportunityCategory } from "@/lib/supabase/database.types";
import { safeParseUrl } from "./url";

export type ExtractInput = {
  category: OpportunityCategory;
  title: string;
  /** Judul + awal deskripsi + tag (plain text). */
  text: string;
  url: string;
  location?: string | null;
  remote?: boolean | null;
  tags?: string[];
  skills: string[];
};

export type ExtractResult = {
  details: Partial<Record<DetailKey, string>>;
  location: string | null;
};

const JOB_FUNCTIONS: Record<string, string> = {
  engineering: "Engineering",
  research: "Riset",
  sales: "Sales",
  marketing: "Marketing",
  design: "Desain",
  product: "Product",
  operations: "Operasional",
  finance: "Keuangan",
  legal: "Legal",
  "customer-support": "Customer support",
  support: "Customer support",
  "business-development": "Business development",
  community: "Komunitas",
  content: "Konten",
  data: "Data",
  security: "Keamanan",
  "human-resources": "HR",
  people: "HR",
};

/** Kata yang bisa muncul sebelum "Testnet" tapi bukan nama jaringan. */
const NOT_A_NETWORK =
  /^(the|a|an|announcing|global|new|public|incentivi[sz]ed|upcoming|january|february|march|april|may|june|july|august|september|october|november|december|q[1-4])$/i;

function first<T extends string>(text: string, rules: Array<[T, RegExp]>): T | undefined {
  return rules.find(([, re]) => re.test(text))?.[0];
}

function cleanPlace(input: string): string {
  return input
    .replace(/\bthe\s+/gi, "")
    .replace(/,?\s+or\s+/gi, ", ")
    .replace(/\s+and\s+/gi, ", ")
    .replace(/\s+/g, " ")
    .replace(/[.,;\s]+$/, "")
    .trim()
    .slice(0, 120);
}

function extractJobLocation(text: string): string | null {
  if (/\b(no geographical restrictions|work remotely from anywhere|anywhere in the world|globally remote)\b/i.test(text)) {
    return "Global — bisa dari mana saja";
  }
  const remoteIn = /\bremotely anywhere in ([^.]{3,120})/i.exec(text) ?? /\bremote(?:ly)? (?:within|from) ([^.]{3,120})/i.exec(text);
  if (remoteIn) return `Remote: ${cleanPlace(remoteIn[1]!)}`;
  const basedIn = /\b(?:based in|located in|on-?site in|in-office in|office in) ([^.]{3,120})/i.exec(text);
  if (basedIn) return cleanPlace(basedIn[1]!);
  return null;
}

function extractJobFunction(url: string): string | undefined {
  const segment = safeParseUrl(url)?.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
  return segment ? JOB_FUNCTIONS[segment] : undefined;
}

function extractJob(input: ExtractInput): ExtractResult {
  const { title, text } = input;
  const details: ExtractResult["details"] = {};

  const employment = first(text, [
    ["internship", /\bintern(ship)?s?\b/i],
    ["part_time", /\bpart[- ]time\b/i],
    ["full_time", /\bfull[- ]time\b/i],
    ["contract", /\bcontract(or)?\b/i],
    ["freelance", /\bfreelance\b/i],
  ]);
  if (employment) details.employment_type = employment;

  const mode =
    first(text, [
      ["hybrid", /\bhybrid\b/i],
      ["remote", /\b(100% remote|fully remote|remote(ly)?|work from anywhere)\b/i],
      ["onsite", /\b(on-?site|in[- ]office|in person)\b/i],
      // "This is a full-time position that is based in Paris." tanpa kata remote = kerja di lokasi.
      ["onsite", /\b(?:is|can be) based in\b/i],
    ]) ?? (input.remote === true ? "remote" : input.remote === false ? "onsite" : undefined);
  if (mode) details.work_mode = mode;

  // Level hanya dari judul; tidak ditebak bila tidak tertulis.
  const level = first(title, [
    ["intern", /\bintern\b/i],
    ["executive", /\b(head of|director|vp|vice president|chief|cto|ceo|cfo|coo|cmo)\b/i],
    ["lead", /\b(staff|principal|lead)\b/i],
    ["senior", /\b(senior|sr\.?)\b/i],
    ["junior", /\b(junior|jr\.?|entry[- ]level|graduate)\b/i],
  ]);
  if (level) details.experience_level = level;

  const fn = extractJobFunction(input.url);
  if (fn) details.job_function = fn;

  return { details, location: input.location?.trim() || extractJobLocation(text) };
}

function taskTypeFromSkills(skills: string[], text: string): string | undefined {
  if (skills.includes("security")) return "security";
  if (skills.some((s) => ["solidity", "rust", "move", "typescript", "frontend", "backend", "smart-contract"].includes(s))) return "development";
  if (skills.includes("design")) return "design";
  if (skills.includes("video")) return "video";
  if (skills.includes("writing")) return "content";
  if (skills.includes("research")) return "research";
  if (/\b(community|social|twitter|x\.com|discord)\b/i.test(text)) return "community";
  return undefined;
}

export function extractDetails(input: ExtractInput): ExtractResult {
  const { category, title, text } = input;
  if (category === "jobs") return extractJob(input);

  const details: ExtractResult["details"] = {};
  const location = input.location?.trim() || null;

  switch (category) {
    case "hackathon": {
      const online = /\b(online|virtual)\b/i.test(text) || /^online$/i.test(location ?? "");
      const offline = /\b(in[- ]person|irl|offline)\b/i.test(text) || Boolean(location && !/^online$/i.test(location));
      if (online && offline) details.event_format = "hybrid";
      else if (online) details.event_format = "online";
      else if (offline) details.event_format = "offline";
      if (input.tags?.length) details.tracks = input.tags.slice(0, 6).join(", ");
      break;
    }
    case "grants": {
      const type = first(text, [
        ["retroactive", /\bretro(active)?\b/i],
        ["rfp", /\b(RFPs?|request for proposals?)\b/i],
        ["research", /\b(academic|research) grants?\b/i],
        ["milestone", /\bmilestone/i],
        ["grant", /\bgrants?\b/i],
      ]);
      if (type) details.funding_type = type;
      break;
    }
    case "testnet": {
      const network = /([\p{Lu}][\p{L}\d-]{2,30})\s+(?:Global\s+)?Testnet\b/u.exec(title)?.[1];
      if (network && !NOT_A_NETWORK.test(network)) details.network = network;
      const task = taskTypeFromSkills(input.skills, text);
      if (task) details.task_type = task;
      break;
    }
    case "bounty": {
      const task = taskTypeFromSkills(input.skills, text);
      if (task) details.task_type = task;
      break;
    }
    case "contest": {
      const formats = [
        /\bmemes?\b/i.test(text) && "Meme",
        /\bvideos?\b/i.test(text) && "Video",
        /\b(design|artwork|art)\b/i.test(text) && "Desain",
        /\b(writing|article|essay|thread)s?\b/i.test(text) && "Tulisan",
      ].filter(Boolean);
      if (formats.length) details.submission_format = formats.join(", ");
      if (/\b(raffle|random(ly)? (selected|drawn)|lucky draw)\b/i.test(text)) details.selection_method = "raffle";
      else if (/\bjudg(e|es|ed|ing)\b/i.test(text)) details.selection_method = "judged";
      break;
    }
    case "giveaway": {
      if (/\b(raffle|random(ly)? (selected|drawn)|lucky draw|undian)\b/i.test(text)) details.selection_method = "raffle";
      else if (/\bfirst[- ]come\b/i.test(text)) details.selection_method = "first_come";
      break;
    }
    case "airdrop": {
      const method = first(text, [
        ["snapshot", /\bsnapshot\b/i],
        ["onchain", /\bon-?chain (activity|usage|transactions?)\b/i],
        ["tasks", /\b(quests?|tasks?|missions?)\b/i],
      ]);
      if (method) details.eligibility_method = method;
      break;
    }
    default:
      break;
  }
  return { details, location };
}
