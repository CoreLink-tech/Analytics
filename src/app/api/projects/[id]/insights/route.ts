import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  buildInsightContext,
  generateAiInsights,
  isAiConfigured,
} from "@/lib/analytics/insights";
import { rateLimit } from "@/lib/security/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const limited = rateLimit(`insights:${session.user.id}`, 20, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many insight requests. Try again later." },
      { status: 429 }
    );
  }

  const { id: projectId } = await context.params;
  const ctx = await buildInsightContext(projectId, session.user.id);
  if (!ctx) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  try {
    const result = await generateAiInsights(ctx);
    return NextResponse.json({
      insights: result.text,
      provider: result.provider,
      aiConfigured: isAiConfigured(),
    });
  } catch (err) {
    console.error("insights failed", err);
    return NextResponse.json(
      { error: "Failed to generate insights." },
      { status: 500 }
    );
  }
}
