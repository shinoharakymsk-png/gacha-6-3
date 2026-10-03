'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GachaItem, Gacha } from '@/types';
import { drawGachaItem, drawMultipleItems, playSoundEffect } from '@/lib/gachaLogic';
import { checkFeverStatus, FeverStatus } from '@/lib/fever';
import { Play, Sparkles, FastForward, Flame } from 'lucide-react';

interface CapsuleMachineProps {
  gacha: Gacha;
  onDrawComplete: (items: GachaItem[], isMulti: boolean) => void;
}

export const CapsuleMachine: React.FC<CapsuleMachineProps> = ({ gacha, onDrawComplete }) => {
  const [isCranking, setIsCranking] = useState(false);
  const [crankAngle, setCrankAngle] = useState(0);
  const [auraStage, setAuraStage] = useState<'none' | 'blue' | 'red' | 'gold' | 'rainbow'>('none');
  const [dispensedColor, setDispensedColor] = useState<string | null>(null);
  const [fever, setFever] = useState<FeverStatus>({ isAvailableTime: true, isFeverActive: false, multiplier: 1 });
  const skipRef = useRef<boolean>(false);
  const timerIdsRef = useRef<NodeJS.Timeout[]>([]);

  // フィーバーチェック
  useEffect(() => {
    setFever(checkFeverStatus());
    const interval = setInterval(() => {
      setFever(checkFeverStatus());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const auraStyles = {
    none: '',
    blue: 'ring-8 ring-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.8)]',
    red: 'ring-8 ring-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.9)] animate-pulse',
    gold: 'ring-10 ring-amber-400 shadow-[0_0_50px_rgba(251,191,36,1)] animate-pulse',
    rainbow: 'ring-12 ring-purple-500 shadow-[0_0_60px_rgba(168,85,247,1)] animate-bounce',
  };

  const capsuleColors = [
    'from-rose-400 to-red-500',
    'from-amber-400 to-yellow-500',
    'from-emerald-400 to-green-500',
    'from-sky-400 to-blue-500',
    'from-purple-400 to-indigo-500',
    'from-pink-400 to-rose-500',
    'from-cyan-400 to-teal-500',
    'from-orange-400 to-amber-500',
  ];

  const clearAllTimers = () => {
    timerIdsRef.current.forEach(clearTimeout);
    timerIdsRef.current = [];
  };

  const handleSkip = () => {
    if (!isCranking) return;
    skipRef.current = true;
    clearAllTimers();
    setIsCranking(false);
    setAuraStage('none');
    setDispensedColor(null);
  };

  const handleDraw = (count: number = 1) => {
    if (isCranking || gacha.items.length === 0) return;

    // スマホ触覚振動
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([30, 50, 30]);
    }

    setIsCranking(true);
    skipRef.current = false;
    setAuraStage('none');
    setDispensedColor(null);

    const drawnResults = count === 1 ? [drawGachaItem(gacha.items)] : drawMultipleItems(gacha.items, count);
    const hasUR = drawnResults.some((i) => i.rarity === 'UR');
    const hasSSR = drawnResults.some((i) => i.rarity === 'SSR');
    const hasSR = drawnResults.some((i) => i.rarity === 'SR');

    playSoundEffect('crank');
    setCrankAngle((prev) => prev + 360);

    const runIfNoSkip = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (!skipRef.current) fn();
      }, ms);
      timerIdsRef.current.push(id);
    };

    runIfNoSkip(() => {
      playSoundEffect('capsule');
      const randomColor = capsuleColors[Math.floor(Math.random() * capsuleColors.length)];
      setDispensedColor(randomColor);
      setAuraStage('blue');
    }, 600);

    runIfNoSkip(() => {
      if (hasSR || hasSSR || hasUR) {
        playSoundEffect('reveal');
        setAuraStage('red');
      }
    }, 1100);

    runIfNoSkip(() => {
      if (hasSSR || hasUR) {
        playSoundEffect('rare');
        setAuraStage('gold');
      }
    }, 1600);

    runIfNoSkip(() => {
      if (hasUR) {
        playSoundEffect('rare');
        setAuraStage('rainbow');
      }
    }, 2100);

    runIfNoSkip(() => {
      setIsCranking(false);
      setAuraStage('none');
      setDispensedColor(null);
      onDrawComplete(drawnResults, count > 1);
    }, hasUR ? 2600 : hasSSR ? 2100 : hasSR ? 1700 : 1200);
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* フィーバー告知バナー */}
      {fever.isFeverActive && (
        <div className="mb-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5 animate-bounce">
          <Flame size={16} className="text-yellow-300" />
          <span>🔥 フィーバータイム発動中！SSR・UR出現率が2倍！</span>
        </div>
      )}

      {/* スキップボタン */}
      {isCranking && (
        <div className="w-full max-w-sm flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="flex items-center gap-1 px-4 py-1.5 rounded-2xl bg-slate-800 text-yellow-300 font-black text-xs shadow-lg hover:bg-slate-700 active:scale-95 transition-all animate-pulse"
          >
            <FastForward size={14} />
            <span>SKIP (演出スキップ)</span>
          </button>
        </div>
      )}

      {/* ガチャ自販機本体 */}
      <div
        className={`relative w-72 sm:w-80 bg-gradient-to-b from-red-500 to-red-600 rounded-3xl p-4 shadow-2xl border-4 border-red-700 transition-all duration-300 ${
          fever.isFeverActive ? 'shadow-[0_0_40px_rgba(239,68,68,0.8)] border-orange-500' : ''
        } ${auraStyles[auraStage]}`}
      >
        {/* 上部看板 */}
        <div className="bg-amber-400 border-2 border-amber-500 rounded-xl py-1 px-3 text-center shadow-inner mb-3 flex items-center justify-center gap-1.5">
          {fever.isFeverActive && <Flame size={14} className="text-red-600" />}
          <span className="text-xs font-black text-amber-950 tracking-wider">
            ６年３組 ガシャポン自販機
          </span>
          {fever.isFeverActive && <Flame size={14} className="text-red-600" />}
        </div>

        {/* 透明窓（カプセルがリアルにコロコロ動くドーム） */}
        <div className="relative h-48 bg-sky-100/75 backdrop-blur-sm rounded-2xl border-4 border-white/80 shadow-inner overflow-hidden flex items-center justify-center">
          <div className="absolute top-2 left-3 w-12 h-6 bg-white/60 rounded-full rotate-[-25deg] blur-[1px]"></div>

          {/* リアルコロコロカプセル */}
          <div className="relative w-full h-full p-2 flex flex-wrap items-center justify-center gap-2">
            {capsuleColors.map((color, idx) => (
              <div
                key={idx}
                className={`w-9 h-9 rounded-full bg-gradient-to-b ${color} border-2 border-white shadow-md transition-transform ${
                  isCranking ? 'animate-super-vibrate' : 'animate-shake'
                }`}
                style={{
                  animationDuration: isCranking ? '0.1s' : `${1.8 + (idx % 3) * 0.4}s`,
                  animationDelay: `${idx * 0.1}s`,
                  transform: `rotate(${(idx * 45 + (isCranking ? crankAngle * 2 : 0)) % 360}deg)`,
                }}
              >
                <div className="w-full h-1/2 bg-white/40 rounded-t-full border-b border-black/20"></div>
              </div>
            ))}
          </div>

          {/* 昇格カットイン */}
          {auraStage !== 'none' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
              <span
                className={`font-black text-xl px-4 py-1 rounded-full shadow-lg ${
                  auraStage === 'rainbow'
                    ? 'bg-gradient-to-r from-purple-500 via-rose-500 to-amber-400 text-white animate-bounce text-2xl'
                    : auraStage === 'gold'
                    ? 'bg-yellow-400 text-slate-950'
                    : auraStage === 'red'
                    ? 'bg-rose-600 text-white'
                    : 'bg-sky-500 text-white'
                }`}
              >
                {auraStage === 'rainbow'
                  ? '🌈 超激レア確定!!'
                  : auraStage === 'gold'
                  ? '✨ 激アツ昇格!!'
                  : auraStage === 'red'
                  ? '🔥 チャンス!!'
                  : '回転中...'}
              </span>
            </div>
          )}
        </div>

        {/* ハンドル機構 */}
        <div className="mt-4 bg-red-700/80 rounded-2xl p-4 flex flex-col items-center border border-red-400/40">
          <div className="text-[10px] text-white/80 font-bold mb-2 tracking-widest uppercase">
            TURN HANDLE
          </div>

          <div
            onClick={() => handleDraw(1)}
            style={{ transform: `rotate(${crankAngle}deg)` }}
            className={`w-20 h-20 rounded-full bg-slate-100 border-4 border-slate-300 shadow-xl flex items-center justify-center cursor-pointer active:scale-95 transition-transform duration-700 ease-out hover:shadow-2xl ${
              isCranking ? 'pointer-events-none' : ''
            }`}
            title="クリックして回す！"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute w-16 h-4 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow"></div>
              <div className="absolute w-4 h-16 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full shadow"></div>
              <div className="absolute w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-inner"></div>
            </div>
          </div>
        </div>

        {/* 排出口 */}
        <div className="relative mt-4 h-16 bg-slate-900 rounded-xl border-4 border-slate-800 shadow-inner flex items-center justify-center overflow-hidden">
          {dispensedColor ? (
            <div
              className={`w-11 h-11 rounded-full bg-gradient-to-b ${dispensedColor} border-2 border-white shadow-lg animate-drop`}
            >
              <div className="w-full h-1/2 bg-white/40 rounded-t-full border-b border-black/20"></div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 font-bold tracking-wider">
              {isCranking ? 'カランコロン...' : 'PUSH (取出口)'}
            </div>
          )}
        </div>
      </div>

      {/* 回すボタン */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => handleDraw(1)}
          disabled={isCranking}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 text-white font-black text-sm shadow-lg hover:shadow-xl transform active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 border-b-4 border-red-800"
        >
          <Play size={16} fill="white" />
          <span>1回 まわす</span>
        </button>

        <button
          onClick={() => handleDraw(10)}
          disabled={isCranking}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-sm shadow-lg hover:shadow-xl transform active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 border-b-4 border-amber-700"
        >
          <Sparkles size={16} />
          <span>10連 まわす！</span>
        </button>
      </div>
    </div>
  );
};
