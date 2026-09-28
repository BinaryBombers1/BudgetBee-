import { createHash, randomUUID } from "node:crypto";
import WebSocket from "ws";

/**
 * Neural text-to-speech via Microsoft Edge's free read-aloud service
 * (the same voices Edge uses; no API key required).
 *
 * Mirrors the AI-layer philosophy: try the free neural engine; if it
 * fails, the route returns 502 and the client falls back to the
 * browser's built-in speechSynthesis. Never hard-fails.
 */

const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const BASE = "speech.platform.bing.com/consumer/speech/synthesize/readaloud";
const WSS_URL = `wss://${BASE}/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}`;
const SEC_MS_GEC_VERSION = "1-143.0.3650.75";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0";

const MAX_CHUNK_BYTES = 4096;
const SYNTH_TIMEOUT_MS = 9000;
const CACHE_MAX_ENTRIES = 100;

export const NEURAL_VOICES = {
  en: "en-US-EmmaMultilingualNeural",
  bn: "bn-BD-NabanitaNeural",
  ur: "ur-PK-UzmaNeural",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function dateToString(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${DAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${p(d.getUTCDate())} ${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} GMT+0000 (Coordinated Universal Time)`;
}

function secMsGec() {
  let ticks = Date.now() / 1000 + 11644473600;
  ticks -= ticks % 300;
  ticks *= 1e7;
  return createHash("sha256")
    .update(`${ticks.toFixed(0)}${TRUSTED_CLIENT_TOKEN}`)
    .digest("hex")
    .toUpperCase();
}

function muidCookie() {
  const h = createHash("sha256").update(String(Math.random())).digest("hex");
  return `muid=${h.slice(0, 32).toUpperCase()};`;
}

export function pickVoice(locale) {
  const prefix = String(locale || "en").slice(0, 2).toLowerCase();
  return NEURAL_VOICES[prefix] || NEURAL_VOICES.en;
}

/* replace control chars the service rejects (edge-tts does the same) */
function stripControl(raw) {
  let out = "";
  for (const ch of String(raw)) {
    const c = ch.codePointAt(0);
    if (c <= 8 || c === 11 || c === 12 || (c >= 14 && c <= 31)) out += " ";
    else out += ch;
  }
  return out;
}

/* then XML-escape */
function prepareText(raw) {
  return stripControl(raw)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* split escaped text into <=4096-byte chunks, preferring spaces and never
   cutting an XML entity in half */
function chunkEscaped(escaped) {
  const buf = Buffer.from(escaped, "utf8");
  if (buf.length <= MAX_CHUNK_BYTES) return [escaped];
  const chunks = [];
  let start = 0;
  while (start < buf.length) {
    let end = Math.min(start + MAX_CHUNK_BYTES, buf.length);
    if (end < buf.length) {
      const slice = buf.subarray(start, end);
      let cut = slice.lastIndexOf(0x20);
      if (cut <= 0) cut = MAX_CHUNK_BYTES;
      end = start + cut;
      const tail = buf.subarray(start, end);
      const amp = tail.lastIndexOf(0x26);
      if (amp >= 0 && tail.subarray(amp).indexOf(0x3b) < 0) {
        end = start + amp;
        if (end <= start) end = Math.min(start + MAX_CHUNK_BYTES, buf.length);
      }
    }
    const piece = buf.subarray(start, end).toString("utf8").trim();
    if (piece) chunks.push(piece);
    start = end;
  }
  return chunks.length ? chunks : [escaped];
}

function synthesizeChunk(text, voice) {
  return new Promise((resolve, reject) => {
    const connectionId = randomUUID().replace(/-/g, "");
    const url =
      `${WSS_URL}&ConnectionId=${connectionId}` +
      `&Sec-MS-GEC=${secMsGec()}&Sec-MS-GEC-Version=${SEC_MS_GEC_VERSION}`;

    let ws;
    try {
      ws = new WebSocket(url, {
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
          Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
          "Sec-WebSocket-Version": "13",
          "User-Agent": USER_AGENT,
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "en-US,en;q=0.9",
          Cookie: muidCookie(),
        },
      });
    } catch (e) {
      reject(e);
      return;
    }

    const chunks = [];
    let settled = false;
    const timer = setTimeout(() => finish(new Error("tts-timeout")), SYNTH_TIMEOUT_MS);

    function finish(err) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        ws.terminate();
      } catch {
        /* already gone */
      }
      if (err) reject(err);
      else resolve(Buffer.concat(chunks));
    }

    ws.on("open", () => {
      const config =
        `X-Timestamp:${dateToString()}\r\n` +
        "Content-Type:application/json; charset=utf-8\r\n" +
        "Path:speech.config\r\n\r\n" +
        '{"context":{"synthesis":{"audio":{"metadataoptions":{' +
        '"sentenceBoundaryEnabled":"true","wordBoundaryEnabled":"false"},' +
        '"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n';
      ws.send(config);

      const ssml =
        "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>" +
        `<voice name='${voice}'>` +
        `<prosody pitch='+0Hz' rate='+0%' volume='+0%'>${text}</prosody>` +
        "</voice></speak>";
      ws.send(
        `X-RequestId:${randomUUID().replace(/-/g, "")}\r\n` +
          "Content-Type:application/ssml+xml\r\n" +
          `X-Timestamp:${dateToString()}Z\r\n` +
          "Path:ssml\r\n\r\n" +
          ssml
      );
    });

    ws.on("message", (data, isBinary) => {
      if (isBinary) {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
        if (buf.length < 4) return;
        const headerLen = buf.readUInt16BE(0);
        if (headerLen > buf.length) return;
        const head = buf.subarray(0, headerLen).toString("latin1");
        if (!head.includes("Path:audio")) return;
        const body = buf.subarray(headerLen + 2);
        if (body.length) chunks.push(body);
        return;
      }
      const textMsg = data.toString("utf8");
      const splitAt = textMsg.indexOf("\r\n\r\n");
      const head = splitAt >= 0 ? textMsg.slice(0, splitAt) : textMsg;
      const m = head.match(/Path:(.+)/);
      const path = m ? m[1].trim() : "";
      if (path === "turn.end") {
        if (!chunks.length) finish(new Error("tts-no-audio"));
        else finish(null);
      }
    });

    ws.on("unexpected-response", (_req, res) => {
      finish(new Error(`tts-http-${res.statusCode}`));
    });
    ws.on("error", (e) => finish(e instanceof Error ? e : new Error(String(e))));
    ws.on("close", () => finish(new Error("tts-closed")));
  });
}

/* tiny LRU: identical phrases (read-aloud re-clicks, chat re-sends) hit cache */
const audioCache = new Map();

function cacheGet(key) {
  const v = audioCache.get(key);
  if (v) {
    audioCache.delete(key);
    audioCache.set(key, v);
  }
  return v;
}

function cacheSet(key, v) {
  if (audioCache.size >= CACHE_MAX_ENTRIES) {
    audioCache.delete(audioCache.keys().next().value);
  }
  audioCache.set(key, v);
}

export async function synthesizeSpeech({ text, locale }) {
  const voice = pickVoice(locale);
  const prepared = prepareText(text);
  if (!prepared.trim()) throw new Error("tts-empty");
  const key = `${voice}|${prepared}`;
  const cached = cacheGet(key);
  if (cached) return { audio: cached, voice, cached: true };

  const pieces = chunkEscaped(prepared);
  const parts = [];
  for (const piece of pieces) {
    parts.push(await synthesizeChunk(piece, voice));
  }
  const audio = Buffer.concat(parts);
  if (!audio.length) throw new Error("tts-no-audio");
  cacheSet(key, audio);
  return { audio, voice, cached: false };
}

export function ttsEngineStatus() {
  return { engine: "neural", voices: NEURAL_VOICES, keyRequired: false };
}
