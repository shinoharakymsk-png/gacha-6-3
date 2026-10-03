'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Sun, CheckCircle2, RotateCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyFortune, UserFortuneHistory } from '@/types';
import { getFortunes, getTodayUserFortune, saveTodayUserFortune } from '@/lib/storage';
import { drawFortune, playSoundEffect } from '@/lib/gachaLogic';

interface DailyFortuneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFortuneDrawn?: (fortune: DailyFortune) => void;
}

export const DailyFortuneModal: React.FC<DailyFortuneModalProps> = ({
  isOpen,
  onClose,
  onFortuneDrawn,
}) => {
  const [fortunes, setFortunes] = useState<DailyFortune[]>([]);
  const [todayHistory, setTodayHistory] = useState<UserFortuneHistory | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentFortune, setCurrentFortune] = useState<DailyFortune | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const loadedFortunes = await getFortunes();
    setFortunes(loadedFortunes);
    const existing = getTodayUserFortune();
    setTodayHistory(existing);
    if (existing) {
      setCurrentFortune(existing.fortune);
    } else {
      setCurrentFortune(null);
    }
  };

  const handleDrawFortune = () => {
    if (isSpinning || fortunes.length === 0) return;
    setIsSpinning(true);
    playSoundEffect('crank');

    setTimeout(() => {
      playSoundEffect('reveal');
      const selected = drawFortune(fortunes);
      setCurrentFortune(selected);
      saveTodayUserFortune(selected);
      setTodayHistory(getTodayUserFortune());
      setIsSpinning(false);

      if (onFortuneDrawn) {
        onFortuneDrawn(selected);
      }

      // 大吉・超大吉なら紙吹雪
      if (selected.fortune_rank.includes('吉')) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md chalkboard-bg p-6 text-center text-white shadow-2xl overflow-hidden">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
          aria-label="閉じる"
        >
          <X size={20} />
        </button>

        {/* ヘッダー飾り */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sun className="text-yellow-400 animate-spin" style={{ animationDuration: '10s' }} size={24} />
          <span className="text-xs font-bold bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full">
            ６年３組 毎日の日直占い
          </span>
          <Sun className="text-yellow-400 animate-spin" style={{ animationDuration: '10s' }} size={24} />
        </div>

        <h2 className="text-2xl font-black chalk-text-yellow mb-1 tracking-wide">
          🎒 今日のガチャ（今日の運勢）
        </h2>
        <p className="text-xs text-emerald-100/80 mb-5">
          毎日最初の登校（アクセス）時に1回だけ引ける今日の運勢！
        </p>

        {/* 運勢結果エリア */}
        {currentFortune ? (
          <div className="bg-white/10 border-2 border-dashed border-emerald-300/40 rounded-2xl p-5 mb-5 backdrop-blur-md animate-drop">
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-black text-2xl px-6 py-1.5 rounded-full shadow-lg mb-3">
              {currentFortune.fortune_rank}
            </div>

            <p className="text-base font-medium text-emerald-50 leading-relaxed mb-4">
              {currentFortune.message}
            </p>

            <div className="bg-emerald-950/60 rounded-xl p-3 border border-emerald-500/30">
              <span className="text-xs font-bold text-yellow-300 block mb-1">
                ⭐ 本日のラッキーアイテム
              </span>
              <span className="text-sm font-bold text-white">
                {currentFortune.lucky_item}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-300">
              <CheckCircle2 size={14} />
              <span>本日の運勢は記録されました！（毎日0時更新）</span>
            </div>
          </div>
        ) : (
          <div className="py-8 my-3 flex flex-col items-center justify-center">
            {/* 未引き状態の演出アイコン */}
            <div
              className={`w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-400 to-yellow-300 flex items-center justify-center text-5xl shadow-xl mb-6 cursor-pointer transform hover:scale-105 transition-all ${
                isSpinning ? 'animate-shake' : 'animate-bounce'
              }`}
              onClick={handleDrawFortune}
            >
              {isSpinning ? '🌀' : '🔮'}
            </div>

            <button
              onClick={handleDrawFortune}
              disabled={isSpinning}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-lg shadow-lg transform active:scale-95 transition-all flex items-center gap-2"
            >
              {isSpinning ? (
                <>
                  <RotateCw className="animate-spin" size={20} />
                  <span>運勢を占っています...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>今日の運勢を回す！</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* フッター */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/70">
          <span>※「作る」モードで新しい運勢を追加できます</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold transition-colors"
          >
            教室へ行く
          </button>
        </div>
      </div>
    </div>
  );
};
