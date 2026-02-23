import "./style.css";
import * as webllm from "@mlc-ai/web-llm";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <h1>Browser LLM</h1>
  <div id="status"></div>
  <textarea id="prompt" placeholder="Enter your prompt here..." rows="4" style="width: 100%; margin-top: 10px;"></textarea>
  <button id="generate" disabled>Generate</button>
  <pre id="output" style="white-space: pre-wrap; margin-top: 10px;"></pre>
`;

const generateButton = document.querySelector<HTMLButtonElement>("#generate")!;
const statusDiv = document.querySelector<HTMLDivElement>("#status")!;
const promptTextarea = document.querySelector<HTMLTextAreaElement>("#prompt")!;
const outputPre = document.querySelector<HTMLPreElement>("#output")!;

let engine: webllm.MLCEngine | null = null;

async function initModel() {
  statusDiv.textContent = "Loading model...";

  try {
    engine = await webllm.CreateMLCEngine("Llama-3.2-1B-Instruct-q4f16_1-MLC", {
      initProgressCallback: (info) => {
        statusDiv.textContent = info.text;
      },
    });
    statusDiv.textContent = "Model ready!";
    generateButton.disabled = false;
  } catch (err) {
    statusDiv.textContent = `Error: ${err}`;
  }
}

initModel();

generateButton.addEventListener("click", async () => {
  if (!engine) return;

  const prompt = promptTextarea.value;
  if (!prompt) return;

  generateButton.disabled = true;
  outputPre.textContent = "";

  try {
    const reply = await engine.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
    });
    outputPre.textContent = reply.choices[0].message.content || "";
  } catch (err) {
    outputPre.textContent = `Error: ${err}`;
  } finally {
    generateButton.disabled = false;
  }
});
