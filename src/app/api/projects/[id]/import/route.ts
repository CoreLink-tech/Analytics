import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { assertFileSize, parseUpload } from "@/lib/analytics/parse";
import { runImport, suggestMapping, type ColumnMapping } from "@/lib/analytics/import";
import { getProjectForUser } from "@/lib/projects/store";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST multipart: file + optional mapping JSON fields
 * Or JSON body with { content, filename, mapping }
 */
export async function POST(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id: projectId } = await context.params;
  const project = await getProjectForUser(projectId, session.user.id);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let text = "";
    let filename = "upload.csv";
    let mapping: ColumnMapping | null = null;
    let previewOnly = false;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "file is required." }, { status: 400 });
      }
      assertFileSize(file.size);
      text = await file.text();
      filename = file.name || filename;
      const mappingRaw = form.get("mapping");
      if (typeof mappingRaw === "string" && mappingRaw.trim()) {
        mapping = JSON.parse(mappingRaw) as ColumnMapping;
      }
      previewOnly = form.get("preview") === "1" || form.get("preview") === "true";
    } else {
      const body = (await request.json()) as {
        content?: string;
        filename?: string;
        mapping?: ColumnMapping;
        preview?: boolean;
      };
      if (!body.content) {
        return NextResponse.json({ error: "content is required." }, { status: 400 });
      }
      assertFileSize(Buffer.byteLength(body.content, "utf8"));
      text = body.content;
      filename = body.filename || filename;
      mapping = body.mapping ?? null;
      previewOnly = !!body.preview;
    }

    const parsed = parseUpload(filename, text);
    const suggested = suggestMapping(parsed.headers);

    if (previewOnly || !mapping) {
      return NextResponse.json({
        preview: true,
        format: parsed.format,
        headers: parsed.headers,
        sampleRows: parsed.rows.slice(0, 5),
        rowCount: parsed.rows.length,
        suggestedMapping: suggested,
        warnings: parsed.warnings,
      });
    }

    const result = await runImport({
      projectId,
      userId: session.user.id,
      source: parsed.format,
      originalFileName: filename,
      rows: parsed.rows,
      mapping,
      warnings: parsed.warnings,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      summary: {
        accepted: result.accepted,
        rejected: result.rejected,
        duplicates: result.duplicates,
        total: result.batch.totalRows,
        status: result.batch.status,
      },
      batch: result.batch,
      errors: result.errors,
      warnings: result.warnings,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
