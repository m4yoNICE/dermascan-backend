import { ENV } from "../config/env.js";

export async function checkImgPython(imageBuffer) {
  try {
    const response = await fetch(`${ENV.AI_API_URL}/check-quality`, {
      method: "POST",
      body: imageBuffer,
      headers: {
        "Content-Type": "application/octet-stream",
        Authorization: `Bearer ${ENV.HF_TOKEN}`,
      },
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Python server returned non-JSON: ${text.slice(0, 200)}`);
    }

    if (!response.ok) {
      throw new Error(data.detail || "Python server error");
    }

    return data;
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        "Python AI server is not running. Start it with: python server.py",
      );
    }
    throw error;
  }
}
