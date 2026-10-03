'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GachaItem } from '@/types';
import { RARITY_INFO, playSoundEffect } from '@/lib/gachaLogic';
import { addReaction, getReactions } from '@/lib/storage';
import confetti from 'canvas-confetti';
import { X, Sparkles, Trophy, RotateCcw, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GachaItem[];
  isMulti: boolean;
  onSpinAgain: () => void;
}

const EMOJI_LIST = ['👏', '🤣', '❤️', '⭐', '🔥'];

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  onClose,
  items,
  isMulti,
  onSpinAgain,
}) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});

  // 溜め演出ステート: 'intro' | 'buildup' | 'burst' | 'revealed'
  const [revealPhase, setRevealPhase] = useState<'intro' | 'buildup' | 'burst' | 'revealed'>('intro');
  const timerIdsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (isOpen && items.length > 0) {
      setSelectedItemIndex(0);
      setReactions(getReactions());
      startBuildupSequence(items[0]);

      return () => {
        timerIdsRef.current.forEach(clearTimeout);
        timerIdsRef.current = [];
      };
    }
  }, [isOpen, items]);

  const startBuildupSequence = (item: GachaItem) => {
    timerIdsRef.current.forEach(clearTimeout);
    timerIdsRef.current = [];

    const rarityInfo = RARITY_INFO[item.rarity] || RARITY_INFO.N;
    const pattern = rarityInfo.patternType; // 'normal' | 'rare' | 'super'

    setRevealPhase('intro');

    // 1. 溜め開始
    const t1 = setTimeout(() => {
      setRevealPhase('buildup');
      if (pattern === 'super') {
        playSoundEffect('heartbeat');
        setTimeout(() => playSoundEffect('heartbeat'), 500);
        setTimeout(() => playSoundEffect('heartbeat'), 1000);
      } else if (pattern === 'rare') {
        playSoundEffect('heartbeat');
        setTimeout(() => playSoundEffect('heartbeat'), 600);
      }
    }, 400);

    // 2. 爆発・パカッ！
    const burstDelay = pattern === 'super' ? 1800 : pattern === 'rare' ? 1200 : 700;
    const t2 = setTimeout(() => {
      setRevealPhase('burst');
      if (pattern === 'super') {
        playSoundEffect('explosion');
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
        });
      } else if (pattern === 'rare') {
        playSoundEffect('rare');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
        });
      } else {
        playSoundEffect('reveal');
      }

      // 3. アイテム出現
      const t3 = setTimeout(() => {
        setRevealPhase('revealed');
      }, 400);
      timerIdsRef.current.push(t3);
    }, burstDelay);

    timerIdsRef.current.push(t1, t2);
  };

  const handleSelectItem = (idx: number) => {
    setSelectedItemIndex(idx);
    playSoundEffect('click');
    setRevealPhase('revealed'); // 10連で選択切替時は即座に表示
  };

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[selectedItemIndex] || items[0];
  const rarityConfig = RARITY_INFO[currentItem.rarity] || RARITY_INFO.N;
  const currentItemReactions = reactions[currentItem.id] || {};
  const pattern = rarityConfig.patternType;

  const handleEmojiClick = (emoji: string) => {
    playSoundEffect('click');
    const updated = addReaction(currentItem.id, emoji);
    setReactions({ ...updated });
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-500 overflow-y-auto ${
        revealPhase === 'buildup' && pattern === 'super'
          ? 'bg-black/95'
          : 'bg-black/80 backdrop-blur-md'
      }`}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border-4 border-amber-300 my-8 overflow-hidden">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors z-20"
        >
          <X size={20} />
        </button>

        {/* 10連の場合のアイテム一覧 */}
        {isMulti && revealPhase === 'revealed' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Sparkles size={14} />
                <span>10連ガチャ結果一覧（タップで詳細）</span>
              </span>
              <span className="text-xs text-slate-500 font-bold">{items.length}個獲得</span>
            </div>
            <div className="grid grid-cols-5 gap-2 p-2 bg-amber-50/70 dark:bg-slate-800/60 rounded-2xl border border-amber-200">
              {items.map((item, idx) => {
                const isSel = idx === selectedItemIndex;
                const r = RARITY_INFO[item.rarity];
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectItem(idx)}
                    className={`relative p-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                      isSel
                        ? 'bg-amber-400 text-slate-950 font-bold scale-105 shadow-md ring-2 ring-amber-500'
                        : 'bg-white dark:bg-slate-700 hover:bg-amber-100 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-xs font-black text-amber-800">
                        {item.rarity}
                      </span>
                    )}
                    <span className={`text-[8px] font-black px-1 rounded-full mt-1 ${r.badgeBg}`}>
                      {item.rarity}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* カプセル開封の「溜め」演出ステージ */}
        {revealPhase !== 'revealed' ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            {/* カプセル本体 */}
            <div className="relative">
              {/* サンバースト光線（激アツ時） */}
              {pattern === 'super' && revealPhase === 'buildup' && (
                <div className="absolute inset-0 -m-16 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 opacity-70 blur-xl animate-spin-slow" />
              )}

              {/* カプセル */}
              <div
                className={`w-32 h-32 rounded-full border-4 border-white shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${
                  pattern === 'super'
                    ? 'bg-gradient-to-b from-purple-500 via-rose-500 to-amber-400'
                    : pattern === 'rare'
                    ? 'bg-gradient-to-b from-amber-300 to-yellow-500'
                    : 'bg-gradient-to-b from-sky-400 to-blue-500'
                } ${
                  revealPhase === 'buildup'
                    ? pattern === 'super'
                      ? 'animate-super-vibrate scale-110 ring-8 ring-amber-400'
                      : 'animate-heartbeat scale-105 ring-4 ring-yellow-300'
                    : 'animate-bounce'
                }`}
              >
                <div className="w-full h-1/2 bg-white/40 border-b-2 border-black/20" />
                <div className="w-full h-1/2" />
              </div>
            </div>

            {/* 溜め演出メッセージ */}
            <div className="mt-8">
              <span
                className={`inline-block font-black text-lg px-6 py-1.5 rounded-full shadow-lg ${
                  pattern === 'super'
                    ? 'bg-gradient-to-r from-purple-600 via-rose-500 to-amber-400 text-white animate-pulse'
                    : pattern === 'rare'
                    ? 'bg-yellow-400 text-slate-900'
                    : 'bg-sky-500 text-white'
                }`}
              >
                {pattern === 'super'
                  ? '⚡ 激アツ！超激レアの予感...！！'
                  : pattern === 'rare'
                  ? '✨ レア確定演出！！'
                  : 'カプセルを開封中...'}
              </span>
            </div>
          </div>
        ) : (
          /* 開封完了後のアイテムカード */
          <div
            className={`relative rounded-3xl p-6 text-center border-4 ${rarityConfig.borderColor} bg-gradient-to-b ${rarityConfig.bgGradient} shadow-xl animate-drop`}
          >
            <div className="inline-block mb-3">
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-md ${rarityConfig.badgeBg}`}
              >
                {rarityConfig.label}
              </span>
            </div>

            {/* 画像表示 */}
            <div className="relative mx-auto my-3 w-36 h-36 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md flex items-center justify-center shadow-inner border-2 border-white/40 overflow-hidden">
              {currentItem.image_url ? (
                <img src={currentItem.image_url} alt={currentItem.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon size={36} className="mb-1 opacity-50" />
                  <span className="text-[10px] font-bold">画像なし</span>
                </div>
              )}

              {currentItem.is_secret && (
                <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                  SECRET
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
              {currentItem.name}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto mb-5 font-medium">
              {currentItem.description || '６年３組の思い出がつまったアイテム！'}
            </p>

            {/* 絵文字評価バー */}
            <div className="pt-4 border-t border-slate-300/60 dark:border-slate-700/60">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                👇 出た景品を絵文字で評価しよう！
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {EMOJI_LIST.map((emoji) => {
                  const count = currentItemReactions[emoji] || 0;
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiClick(emoji)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 transition-all text-sm font-bold group"
                    >
                      <span className="text-base group-hover:scale-125 transition-transform">{emoji}</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-black">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* フッター操作 */}
        {revealPhase === 'revealed' && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/collection"
              className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline px-2 py-1"
            >
              <Trophy size={15} />
              <span>図鑑（コレクション）で確認</span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onSpinAgain();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm transition-colors"
              >
                <RotateCcw size={15} />
                <span>もう一度</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
