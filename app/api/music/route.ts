import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const maxDuration = 120;

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT ?? "neon-emitter-458622-e3";
const LOCATION = process.env.LYRIA_LOCATION ?? "global";
const MODEL = process.env.LYRIA_MODEL ?? "lyria-3-clip-preview";

let ai: GoogleGenAI | null = null;
function getClient() {
  if (!ai) {
    ai = new GoogleGenAI({
      vertexai: true,
      project: PROJECT,
      location: LOCATION,
    });
  }
  return ai;
}

export async function POST(req: Request) {
  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const prompt = (body.prompt ?? "").trim();
  if (!prompt) {
    return NextResponse.json({ error: "missing prompt" }, { status: 400 });
  }

  try {
    const response = await getClient().models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        // Required for Lyria 3 — without AUDIO in responseModalities the API
        // returns 400 INVALID_ARGUMENT. Asking for TEXT too gives us the
        // generated lyrics/caption in adjacent parts (currently ignored, but
        // useful if we ever want to surface them).
        responseModalities: ["AUDIO", "TEXT"],
      },
    });
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const audioPart = parts.find((p) => p.inlineData?.data);
    if (!audioPart?.inlineData?.data) {
      const summary = parts.map((p) => ({
        hasText: !!p.text,
        textLen: p.text?.length,
        hasInlineData: !!p.inlineData,
        inlineKeys: p.inlineData ? Object.keys(p.inlineData) : [],
        mime: p.inlineData?.mimeType,
      }));
      console.error("[/api/music] no audio part. parts:", JSON.stringify(summary));
      return NextResponse.json(
        { error: "Lyria returned no audio part", parts: summary },
        { status: 502 }
      );
    }
    const data = audioPart.inlineData.data;
    const buf =
      typeof data === "string" ? Buffer.from(data, "base64") : Buffer.from(data as Uint8Array);
    const mime = audioPart.inlineData.mimeType ?? "audio/mpeg";
    return new Response(buf, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: unknown) {
    console.error("[/api/music] failed:", e);
    const raw = e instanceof Error ? e.message : String(e);
    // The Gen AI SDK packs the upstream JSON error into .message. Try to unwrap it
    // so the client sees a readable reason (e.g. "model not allowlisted").
    let friendly = raw;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.error?.message) friendly = parsed.error.message;
    } catch {
      /* not JSON, keep raw */
    }
    const isAccess = /not found|access|allow|permission/i.test(friendly);
    return NextResponse.json(
      {
        error: friendly,
        hint: isAccess
          ? `Lyria 3 preview models are gated. Request allowlist access for project ${PROJECT}, or set LYRIA_MODEL to a model your project can call.`
          : undefined,
      },
      { status: 500 }
    );
  }
}
