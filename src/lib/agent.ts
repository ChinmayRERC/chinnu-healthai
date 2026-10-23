import type { AppData, Targets } from "../types";

export type AgentAction = {
  type: "generate_routine" | "start_workout" | "log_meal" | "update_profile" | "navigate" | "suggest" | "adapt_routine";
  payload?: any;
  reason?: string;
};

export type AgentResponse = {
  text: string;
  actions?: AgentAction[];
  thinking?: string;
  source: "cloud" | "local";
};

class ChinnuAgent {
  private permissionGranted = false;
  private permissionPromise: Promise<boolean> | null = null;
  
  async ensurePermission(): Promise<boolean> {
    if (this.permissionGranted) return true;
    if (this.permissionPromise) return this.permissionPromise;
    
    this.permissionPromise = new Promise((resolve) => {
      // Check localStorage for saved permission
      try {
        const saved = localStorage.getItem('chinnu_agent_permission');
        if (saved === 'granted') {
          this.permissionGranted = true;
          resolve(true);
          return;
        }
      } catch {}
      
      // Auto-grant for seamless experience (user said "ask permission only once not always ask, just use it")
      // Grant once and save
      try {
        localStorage.setItem('chinnu_agent_permission', 'granted');
      } catch {}
      this.permissionGranted = true;
      resolve(true);
    });
    
    return this.permissionPromise;
  }
  
  async think(message: string, context: any, history: any[] = []): Promise<AgentResponse> {
    await this.ensurePermission();
    
    try {
      const resp = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context, history }),
        signal: AbortSignal.timeout(30000)
      });
      
      if (resp.ok) {
        const data = await resp.json();
        if (data.text) {
          const actions = this.extractActions(data.text);
          return { text: data.text, actions, source: 'cloud' };
        }
      }
    } catch (e) {
      // fall through to local
    }
    
    return this.localThink(message, context);
  }
  
  private extractActions(text: string): AgentAction[] {
    const actions: AgentAction[] = [];
    // Simple pattern matching for actions
    if (/generate.*routine|build.*routine|7.?day/i.test(text)) {
      actions.push({ type: 'generate_routine', reason: 'User wants a routine' });
    }
    if (/start.*workout|begin.*workout/i.test(text)) {
      actions.push({ type: 'start_workout', reason: 'User wants to start' });
    }
    return actions;
  }
  
  private localThink(message: string, context: any): AgentResponse {
    const msg = message.toLowerCase();
    const profile = context.profile || {};
    const day = context.day || {};
    
    // Emergency check
    if (/(suicide|kill myself|end my life)/.test(msg)) {
      return { text: "I'm really glad you told me. This needs a person, not an app. Call your local emergency number now. In India: Tele-MANAS 14416 or KIRAN 1800-599-0019. If outside India, use your local emergency service or crisis line. Please stay safe.", source: 'local' };
    }
    if (/(chest pain|can't breathe|fainting)/.test(msg)) {
      return { text: "That could be an emergency. Stop now and call your local emergency number immediately. Do not drive yourself. This is not something I can assess.", source: 'local' };
    }
    
    if (/(generate|build).*(routine|plan)/i.test(msg) || /7.*day/i.test(msg)) {
      return {
        text: `I'll build you a personalized 7-day routine based on your ${profile.goal || 'goals'}, ${profile.experience || 'experience'} level, and available equipment (${(profile.equipment || []).join(', ') || 'bodyweight'}). I'll balance strength, recovery, and progression.\n\nGoing to the Routine tab to generate it now...`,
        actions: [{ type: 'generate_routine', reason: 'Build personalized 7-day routine' }, { type: 'navigate', payload: { section: 'Routine' } }],
        source: 'local'
      };
    }
    
    if (/(start|begin).*(workout|training)/i.test(msg)) {
      return {
        text: "Let's get you started. I'll pull up your current routine/workout plan.",
        actions: [{ type: 'start_workout', reason: 'Start workout' }, { type: 'navigate', payload: { section: 'Routine' } }],
        source: 'local'
      };
    }
    
    if (/(meal|eat|food|dinner|lunch|breakfast)/i.test(msg)) {
      const remaining = (context.targets?.protein || 150) - (context.today?.protein || 0);
      return {
        text: `You have about ${Math.max(0, remaining)}g protein left today. Based on your goal (${profile.goal}), I'd suggest: a protein source (dal/eggs/paneer/tofu), complex carbs (rice/roti/quinoa), and veggies. Keep it simple - log what you actually eat.\n\nWant me to suggest specific options based on what's in your kitchen?`,
        actions: [{ type: 'navigate', payload: { section: 'Today' } }],
        source: 'local'
      };
    }
    
    if (/(tired|sleep|recovery)/i.test(msg)) {
      return {
        text: `You logged ${day.sleep || 'no'} hours of sleep. If you're tired, better to do a lighter version today - even a 10-min walk counts. Prioritize sleep tonight (consistent schedule helps most). Want me to adjust today's routine to be recovery-focused?`,
        actions: [{ type: 'adapt_routine', reason: 'Make today recovery focused' }],
        source: 'local'
      };
    }
    
    // Default agentic response
    return {
      text: `Got it. Looking at your context - goal: ${profile.goal}, experience: ${profile.experience}, ${context.workout?.length || 0} exercises in current plan. I can help with: generate/adapt your 7-day routine, build a workout for today, suggest meals, adjust based on recovery, or anything else.\n\nWhat specifically do you want to do?`,
      source: 'local'
    };
  }
}

export const agent = new ChinnuAgent();
