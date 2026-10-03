'use client';

import React from 'react';
import Link from 'next/link';
import { Gacha } from '@/types';
import { Play, Layers, User, Image as ImageIcon } from 'lucide-react';
import { RARITY_INFO } from '@/lib/gachaLogic';

interface GachaCardProps {
  gacha: Gacha;
  onPlay?: (gacha: Gacha) => void;
}

export const GachaCard: React.FC<GachaCardProps> = ({ gacha, onPlay }) => {
  const highestRarity = gacha.items.some((i) => i.rarity === 'UR')
    ? 'UR'
    : gacha.items.some((i) => i.rarity === 'SSR')
    ? 'SSR'
    : gacha.items.some((i) => i.rarity === 'SR')
    ? 'SR'
    : 'R';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-4 border-amber-200 dark:border-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group">
      <div>
        {/* 上部ヘッダー */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300/60">
            🏷️ {gacha.category || '学校生活'}
          </span>
          <span className="text-[11px] font-black bg-gradient-to-r from-amber-400 to-rose-500 text-white px-2.5 py-0.5 rounded-full shadow-xs">
            最高 {highestRarity}
          </span>
        </div>

        {/* カバー画像 & タイトル */}
        <div className="flex items-start gap-3.5 mb-3">
          {gacha.cover_image ? (
            <img
              src={gacha.cover_image}
              alt={gacha.title}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-200 shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-900 font-black text-sm border-2 border-amber-200 shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
              ６-３
            </div>
          )}

          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-amber-600 transition-colors">
              {gacha.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <User size={12} />
              <span>{gacha.author_name || '６年３組'}</span>
            </div>
          </div>
        </div>

        {/* ガチャ説明 */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {gacha.description}
        </p>

        {/* ガチャ内アイテムのミニプレビュー */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 mb-4 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold mb-1.5">
            <span className="flex items-center gap-1">
              <Layers size={12} />
              <span>全{gacha.items.length}種類の景品</span>
            </span>
            <span>🔥 {gacha.play_count || 0}回まわされた</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden">
            {gacha.items.slice(0, 5).map((item, idx) => {
              const r = RARITY_INFO[item.rarity];
              return (
                <span
                  key={idx}
                  title={item.name}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-[10px] font-black shadow-xs border border-slate-200 dark:border-slate-600 overflow-hidden"
                >
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className={r.textColor}>{item.rarity}</span>
                  )}
                </span>
              );
            })}
            {gacha.items.length > 5 && (
              <span className="text-[10px] font-bold text-slate-400 pl-1">
                +{gacha.items.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 回すボタン */}
      <div className="pt-2">
        {onPlay ? (
          <button
            onClick={() => onPlay(gacha)}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-98"
          >
            <Play size={16} fill="white" />
            <span>このガチャを回す！</span>
          </button>
        ) : (
          <Link
            href={`/play?id=${gacha.id}`}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-98"
          >
            <Play size={16} fill="white" />
            <span>このガチャを回す！</span>
          </Link>
        )}
      </div>
    </div>
  );
};
