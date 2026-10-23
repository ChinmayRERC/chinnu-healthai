const NVIDIA_KEYS = [
  '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',
  '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',
  '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',
];

export type CoachMode = 'gym' | 'yoga' | 'pranayama' | 'fitness' | 'general';

export class AICameraCoach {
  private speaking = false;
  private lastSpoken = 0;
  private cooldown = 4000;
  private history: string[] = [];
  private enabled = true;
  
  setEnabled(v: boolean) { this.enabled = v; }
  
  speak(text: string, priority = false) {
    if (!this.enabled || !text) return;
    if (!priority && Date.now() - this.lastSpoken < this.cooldown && this.speaking) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    this.speaking = true;
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.volume = 0.9;
    utter.onend = () => { this.speaking = false; this.lastSpoken = Date.now(); };
    this.history.push(text);
    if (this.history.length > 10) this.history.shift();
    speechSynthesis.speak(utter);
  }
  
  async getCue(video: HTMLVideoElement, canvas: HTMLCanvasElement, info: {
    exercise: string;
    mode: CoachMode;
    reps?: number;
    phase?: string;
    lastCue?: string;
  }): Promise<string | null> {
    if (!this.enabled) return null;
    if (Date.now() - this.lastSpoken < this.cooldown && this.speaking) return null;
    
    try {
      const c = document.createElement('canvas');
      c.width = 640;
      c.height = 480;
      const ctx = c.getContext('2d');
      ctx?.drawImage(video, 0, 0, 640, 480);
      const image = c.toDataURL('image/jpeg', 0.6);
      
      // Try API first
      try {
        const resp = await fetch('/api/coach-vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image,
            exercise: info.exercise,
            mode: info.mode,
            reps: info.reps,
            phase: info.phase,
            lastCue: info.lastCue,
            history: this.history
          }),
          signal: AbortSignal.timeout(10000)
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.cue) return data.cue;
        }
      } catch {}
      
      // Direct to NVIDIA as fallback
      for (const key of NVIDIA_KEYS) {
        try {
          const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'nvidia/nemotron-nano-12b-v2-vl',
              messages: [
                { role: 'system', content: `You are a friendly real-time fitness coach for ${info.mode} training. Give ONE short natural cue (15-30 words). Don't say "fit in frame" repeatedly. Be specific, encouraging, push gently. Prioritize safety.` },
                { role: 'user', content: [
                  { type: 'text', text: `Exercise: ${info.exercise}, reps: ${info.reps||0}, phase: ${info.phase||'unknown'}. Coach this person.` },
                  { type: 'image_url', image_url: { url: image } }
                ]}
              ],
              temperature: 0.75,
              max_tokens: 50
            }),
            signal: AbortSignal.timeout(8000)
          });
          if (resp.ok) {
            const data = await resp.json();
            const text = data.choices?.[0]?.message?.content?.trim().replace(/^["']|["']$/g, '');
            if (text) return text;
          }
        } catch {}
      }
    } catch {}
    return null;
  }
}

export const aiCoach = new AICameraCoach();
