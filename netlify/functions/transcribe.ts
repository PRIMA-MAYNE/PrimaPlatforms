import type { Handler } from "@netlify/functions";

const OPENAI_URL = "https://api.openai.com/v1/audio/transcriptions";

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: "OPENAI_API_KEY not configured" };
    }

    const contentType =
      event.headers["content-type"] || event.headers["Content-Type"];

    if (contentType && contentType.includes("multipart/form-data")) {
      // Proxy multipart directly to OpenAI
      const res = await fetch(OPENAI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: Buffer.from(
          event.body || "",
          event.isBase64Encoded ? "base64" : undefined,
        ),
      });
      const text = await res.text();
      return {
        statusCode: res.status,
        body: text,
        headers: {
          "content-type": res.headers.get("content-type") || "application/json",
        },
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};

    if (!body.audio_url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "audio_url is required" }),
      };
    }

    const audioRes = await fetch(body.audio_url);
    if (!audioRes.ok) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Failed to fetch audio" }),
      };
    }
    const audioBuf = await audioRes.arrayBuffer();

    const form = new FormData();
    form.append("file", new Blob([audioBuf]), "audio.webm");
    form.append("model", "whisper-1");
    if (body.language) form.append("language", body.language);
    if (body.response_format)
      form.append("response_format", body.response_format);

    const openaiRes = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form as any,
    });

    const text = await openaiRes.text();
    return {
      statusCode: openaiRes.status,
      body: text,
      headers: {
        "content-type":
          openaiRes.headers.get("content-type") || "application/json",
      },
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Internal Error" }),
    };
  }
};
