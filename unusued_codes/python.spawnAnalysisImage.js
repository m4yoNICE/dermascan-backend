import { spawn } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

export async function checkImgPython(imageBuffer) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const scriptDirectory = resolve(__dirname, "../../../AI/preprocessing");
  const pythonScript = resolve(scriptDirectory, "check_image_quality.py");
  const python = spawn("python", [pythonScript], {
    cwd: scriptDirectory,
  });

  console.log("Running script at:", pythonScript);
  console.log("Working directory:", scriptDirectory);
  return new Promise((resolve, reject) => {
    let output = "";
    let errorOutput = "";

    python.stdin.write(imageBuffer);
    python.stdin.end();

    python.stdout.on("data", (data) => {
      const text = data.toString();
      console.log("Python stdout:", text);
      output += text;
    });

    python.stderr.on("data", (data) => {
      const error = data.toString();
      console.error("Python stderr:", error);
      errorOutput += error;
    });
    python.on("close", (code) => {
      try {
        const result = JSON.parse(output.trim());
        resolve(result);
      } catch (e) {
        reject(
          new Error(
            `Invalid JSON. Output: ${output}. Parse error: ${e.message}`,
          ),
        );
      }
    });

    python.on("error", (err) => {
      reject(new Error(`Failed to spawn: ${err.message}`));
    });
  });
}
