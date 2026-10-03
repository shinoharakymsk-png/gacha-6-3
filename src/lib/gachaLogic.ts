import { GachaItem, Rarity, DailyFortune } from '@/types';
import { checkFeverStatus } from './fever';

// 重み付きランダム抽選（フィーバータイム対応）
export function drawGachaItem(items: GachaItem[]): GachaItem {
  if (items.length === 0) throw new Error('アイテムがありません');
  const fever = checkFeverStatus();

  // フィーバー時は SSR / UR の出現率を2倍にする
  const calculateWeight = (item: GachaItem) => {
    const base = Math.max(1, item.weight);
    if (fever.isFeverActive && (item.rarity === 'UR' || item.rarity === 'SSR')) {
      return base * 2;
    }
    return base;
  };

  const totalWeight = items.reduce((sum, item) => sum + calculateWeight(item), 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    const weight = calculateWeight(item);
    if (random < weight) {
      return item;
    }
    random -= weight;
  }
  return items[items.length - 1];
}

// 10連ガチャ抽選
export function drawMultipleItems(items: GachaItem[], count: number = 10): GachaItem[] {
  const results: GachaItem[] = [];
  for (let i = 0; i < count; i++) {
    results.push(drawGachaItem(items));
  }
  return results;
}

// 今日の運勢抽選
export function drawFortune(fortunes: DailyFortune[]): DailyFortune {
  if (fortunes.length === 0) throw new Error('運勢データがありません');
  const totalWeight = fortunes.reduce((sum, f) => sum + Math.max(1, f.weight), 0);
  let random = Math.random() * totalWeight;

  for (const f of fortunes) {
    const weight = Math.max(1, f.weight);
    if (random < weight) {
      return f;
    }
    random -= weight;
  }
  return fortunes[fortunes.length - 1];
}

// レアリティの表示用スタイル定義
export const RARITY_INFO: Record<
  Rarity,
  {
    label: string;
    badgeBg: string;
    textColor: string;
    borderColor: string;
    glowColor: string;
    bgGradient: string;
    patternType: 'normal' | 'rare' | 'super';
  }
> = {
  UR: {
    label: 'UR 超激レア',
    badgeBg: 'bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 text-white shadow-lg animate-pulse',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-400',
    glowColor: 'shadow-[0_0_25px_rgba(245,158,11,0.6)]',
    bgGradient: 'from-amber-50 to-rose-50 dark:from-amber-950/40 dark:to-rose-950/40',
    patternType: 'super',
  },
  SSR: {
    label: 'SSR 激レア',
    badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 font-bold shadow-md',
    textColor: 'text-yellow-500',
    borderColor: 'border-yellow-400',
    glowColor: 'shadow-[0_0_18px_rgba(234,179,8,0.5)]',
    bgGradient: 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30',
    patternType: 'super',
  },
  SR: {
    label: 'SR レア',
    badgeBg: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm',
    textColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-400',
    glowColor: 'shadow-[0_0_12px_rgba(168,85,247,0.4)]',
    bgGradient: 'from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20',
    patternType: 'rare',
  },
  R: {
    label: 'R ちょっとレア',
    badgeBg: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white',
    textColor: 'text-sky-600 dark:text-sky-400',
    borderColor: 'border-sky-300',
    glowColor: 'shadow-[0_0_8px_rgba(14,165,233,0.3)]',
    bgGradient: 'from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20',
    patternType: 'normal',
  },
  N: {
    label: 'N ノーマル',
    badgeBg: 'bg-slate-500 text-white',
    textColor: 'text-slate-600 dark:text-slate-400',
    borderColor: 'border-slate-300 dark:border-slate-700',
    glowColor: 'shadow-none',
    bgGradient: 'from-slate-50 to-gray-100 dark:from-slate-900/40 dark:to-gray-900/40',
    patternType: 'normal',
  },
};

// Web Audio API による効果音再生（溜め演出・心音・雷鳴・大爆発）
export function playSoundEffect(
  type: 'crank' | 'capsule' | 'reveal' | 'rare' | 'click' | 'heartbeat' | 'thunder' | 'explosion'
) {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === 'heartbeat') {
      // 重低音の心音（ドクン…）
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'explosion') {
      // 激アツの大爆発音（ドーーン！）
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.62);
    } else if (type === 'crank') {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220 + i * 80, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.07);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
        }, i * 70);
      }
    } else if (type === 'capsule') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } else if (type === 'reveal') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else if (type === 'rare') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const startTime = ctx.currentTime + idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
    }
  } catch {}
}
