import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { runOpportunitySync } from "@/lib/engine/runner";

// Vercel Hobby mengizinkan hingga 300 dtk; engine membatasi diri ~50 dtk.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function handle(request: NextRequest) {
  if (!isAuthorizedCronRequest(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await runOpportunitySync({ trigger: "cron" });
    const changedPublic = result.expired > 0 || result.runs.some((r) => r.published > 0 || r.updated > 0);
    if (changedPublic) revalidatePath("/", "layout");
    const status = result.status === "not_configured" ? 503 : 200;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("[cron/opportunity-sync]", error);
    return NextResponse.json({ error: "sync_failed" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
