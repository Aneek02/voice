// src/services/spawnXtts.js
import { spawn } from "child_process";

export const synthesizeParagraph = (text, speakerId, outPath) =>
  new Promise((resolve, reject) => {
    const py = spawn(process.env.XTTS_PYTHON || "python", ["tts_cli.py"], {
      cwd: "./python/xtts_api",
      env: {
        ...process.env,
        NUMBA_DISABLE_INTEL_SVML: "1",
      },
    });
    py.stdin.write(
      JSON.stringify({
        text,
        speaker: speakerId, // Now expects GridFS file ID or path, adjust Python as needed
        out: outPath,
      }) + "\n"
    );
    py.stdin.end();
    py.stdout.on("data", (data) =>
      console.log(`[XTTS stdout]: ${data.toString()}`)
    );
    py.stderr.on("data", (data) =>
      console.error(`[XTTS stderr]: ${data.toString()}`)
    );
    py.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`XTTS process exited with code ${code}`));
    });
  });
