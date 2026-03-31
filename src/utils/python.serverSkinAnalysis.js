import { ENV } from "../config/env";

export async function skinAnalyze(imageBuffer) {
  try {
    // const response = await fetch("http://127.0.0.1:5000/analyze", {
    const response = await fetch(`${ENV.AI_API_URL}/analyze`, {
      method: "POST",
      body: imageBuffer,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Python server error");
    }

    return await response.json();
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        "Python AI server is not running. Start it with: python server.py",
      );
    }
    throw error;
  }
}
