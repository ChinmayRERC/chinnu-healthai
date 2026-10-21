const DEFAULT_BACKEND = "https://chinnu-ai.onrender.com";
let cached: { token: string; expires: number } | undefined;

export function backendUrl() { return (localStorage.getItem("chinnu-backend") || DEFAULT_BACKEND).replace(/\/$/, ""); }

async function token() {
  if (cached && cached.expires > Date.now()) return cached.token;
  let clientId = localStorage.getItem("chinnu-client-id"); if (!clientId) { clientId = crypto.randomUUID(); localStorage.setItem("chinnu-client-id", clientId); }
  const response = await fetch(`${backendUrl()}/sessions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId }), signal: AbortSignal.timeout(65000) });
  const data = await response.json(); if (!response.ok || typeof data.token !== "string") throw new Error(data.error || "Cloud session is unavailable.");
  cached = { token: data.token, expires: Date.now() + Math.min(Number(data.expiresIn || 900) * 1000, 720000) }; return data.token;
}

export async function askCoach(text: string, context: Record<string, unknown>) {
  const session = await token();
  const response = await fetch(`${backendUrl()}/agent`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session}` }, body: JSON.stringify({ text, context }), signal: AbortSignal.timeout(65000) });
  const data = await response.json(); if (!response.ok) throw new Error(data.error || "Coach request failed.");
  return String(data.text || "I can help with meals, movement, recovery, and your plan.");
}

export class VoiceClient {
  private socket?: WebSocket; private context?: AudioContext; private stream?: MediaStream; private node?: AudioWorkletNode; private source?: MediaStreamAudioSourceNode; private output: AudioBufferSourceNode[] = []; private speaking = false;
  constructor(private onStatus: (value: string) => void, private onText: (value: string) => void) {}
  async connect() {
    this.disconnect(); this.onStatus("Connecting"); this.context = new AudioContext({ sampleRate: 16000 }); await this.context.resume();
    const session = await token(); await this.context.audioWorklet.addModule("/audio-worklet.js"); this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
    const socket = new WebSocket(`${backendUrl().replace(/^http/, "ws")}/voice`); this.socket = socket;
    await new Promise<void>((resolve, reject) => { let ready = false; const timer = setTimeout(() => reject(new Error("Voice connection timed out.")), 20000); socket.onopen = () => socket.send(JSON.stringify({ type: "auth", token: session })); socket.onerror = () => { if (!ready) reject(new Error("Voice service could not be reached.")); }; socket.onclose = () => { clearTimeout(timer); this.onStatus("Offline"); if (ready) this.onText("Cloud voice disconnected. Local features are still available."); }; socket.onmessage = event => { const message = JSON.parse(event.data); if (message.type === "ready") { ready = true; clearTimeout(timer); this.onStatus("Listening"); this.startInput(); resolve(); } if (message.type === "text" || message.type === "transcript" || message.type === "notice") this.onText(message.type === "transcript" ? `Heard: ${message.text}` : message.text); if (message.type === "audio") this.play(message.data, message.rate || 24000); if (message.type === "turnComplete") this.speaking = false; if (message.type === "error") this.onText(message.error); }; });
  }
  private startInput() { this.source = this.context!.createMediaStreamSource(this.stream!); this.node = new AudioWorkletNode(this.context!, "microphone"); const gain = this.context!.createGain(); gain.gain.value = 0; this.source.connect(this.node); this.node.connect(gain); gain.connect(this.context!.destination); this.node.port.onmessage = event => { if (this.speaking || this.socket?.readyState !== WebSocket.OPEN || this.socket.bufferedAmount > 65536) return; const values = event.data as Float32Array, ratio = this.context!.sampleRate / 16000, pcm = new Int16Array(Math.floor(values.length / ratio)); for (let i = 0; i < pcm.length; i++) pcm[i] = Math.max(-1, Math.min(1, values[Math.floor(i * ratio)])) * 32767; let binary = ""; for (const value of new Uint8Array(pcm.buffer)) binary += String.fromCharCode(value); this.socket.send(JSON.stringify({ type: "audio", data: btoa(binary) })); }; }
  private play(base64: string, rate: number) { this.speaking = true; const bytes = Uint8Array.from(atob(base64), value => value.charCodeAt(0)), pcm = new Int16Array(bytes.buffer), buffer = this.context!.createBuffer(1, pcm.length, rate), channel = buffer.getChannelData(0); for (let i = 0; i < pcm.length; i++) channel[i] = pcm[i] / 32768; const source = this.context!.createBufferSource(); source.buffer = buffer; source.connect(this.context!.destination); source.start(); this.output.push(source); source.onended = () => { this.output = this.output.filter(item => item !== source); if (!this.output.length) this.speaking = false; }; }
  disconnect() { this.output.forEach(source => { try { source.stop(); } catch {} }); this.output = []; this.speaking = false; if (this.socket) { this.socket.onclose = null; this.socket.onerror = null; this.socket.onmessage = null; this.socket.close(); } this.node?.disconnect(); this.source?.disconnect(); this.stream?.getTracks().forEach(track => track.stop()); void this.context?.close(); this.socket = undefined; this.context = undefined; this.stream = undefined; this.onStatus("Offline"); }
}
