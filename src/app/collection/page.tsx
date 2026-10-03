'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Gacha, GachaItem, UserCollectionItem } from '@/types';
import { getGachas, getUserCollections, getReactions, addReaction } from '@/lib/storage';
import { RARITY_INFO, playSoundEffect } from '@/lib/gachaLogic';
import { Trophy, Layers, Sparkles, Filter, CheckCircle2, Lock, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { WeatherBackground } from '@/components/WeatherBackground';
import Link from 'next/link';

const EMOJI_LIST = ['👏', '🤣', '❤️', '⭐', '🔥'];

export default function CollectionPage() {
  const [gachas, setGachas] = useState<Gacha[]>([]);
  const [userCollections, setUserCollections] = useState<Record<string, UserCollectionItem>>({});
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [selectedGachaId, setSelectedGachaId] = useState<string>('all');
  const [selectedItemDetail, setSelectedItemDetail] = useState<GachaItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedGachas = await getGachas();
    setGachas(loadedGachas);
    setUserCollections(getUserCollections());
    setReactions(getReactions());
  };

  const handleEmojiClick = (itemId: string, emoji: string) => {
    playSoundEffect('click');
    const updated = addReaction(itemId, emoji);
    setReactions({ ...updated });
  };

  // 全アイテム数と獲得アイテム数
  const allItems = gachas.flatMap((g) => g.items);
  const totalItemsCount = allItems.length;
  const collectedCount = Object.keys(userCollections).length;
  const overallRate = totalItemsCount > 0 ? Math.round((collectedCount / totalItemsCount) * 100) : 0;

  // 表示対象のガチャ
  const displayedGachas =
    selectedGachaId === 'all'
      ? gachas
      : gachas.filter((g) => g.id === selectedGachaId);

  return (
    <div className="min-h-screen text-slate-800 flex flex-col selection:bg-amber-300 relative">
      <WeatherBackground />
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        {/* ナビ戻る */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>ホームへ戻る</span>
          </Link>
        </div>

        {/* 総合達成状況 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-200 shadow-xl mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 font-bold text-xs px-3 py-1 rounded-full mb-2">
                <Trophy size={14} className="text-amber-600" />
                <span>６年３組 ガチャ図鑑</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                コレクション達成状況
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                引いた景品が集まる教室の宝箱！未獲得の景品も集めてコンプリートを目指そう！
              </p>
            </div>

            <div className="w-full md:w-72 bg-amber-50 rounded-2xl p-4 border-2 border-amber-300 shadow-sm text-center">
              <div className="flex items-center justify-between text-xs font-black text-amber-900 mb-1">
                <span>全体のコンプリート率</span>
                <span className="text-lg text-amber-600 font-mono">{overallRate}%</span>
              </div>
              <div className="w-full h-3.5 bg-amber-200/80 rounded-full overflow-hidden p-0.5 mb-2">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full transition-all duration-700"
                  style={{ width: `${overallRate}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-600 font-bold">
                {collectedCount} / {totalItemsCount} 種類 獲得！
              </p>
            </div>
          </div>

          {/* ガチャ絞り込みタブ */}
          <div className="mt-6 pt-6 border-t border-slate-200 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedGachaId('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedGachaId === 'all'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-amber-100 text-slate-700'
              }`}
            >
              すべて表示 ({totalItemsCount}種)
            </button>
            {gachas.map((g) => {
              const gItems = g.items;
              const gCollected = gItems.filter((i) => userCollections[i.id]).length;
              const isSelected = selectedGachaId === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGachaId(g.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-amber-100 text-slate-700'
                  }`}
                >
                  <span>{g.title}</span>
                  <span className="text-[10px] opacity-75">
                    ({gCollected}/{gItems.length})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ガチャごとの図鑑セクション */}
        <div className="space-y-10">
          {displayedGachas.map((gacha) => {
            const gachaItems = gacha.items;
            const collectedInThis = gachaItems.filter((i) => userCollections[i.id]).length;
            const rate = Math.round((collectedInThis / gachaItems.length) * 100);
            const isComplete = collectedInThis === gachaItems.length;

            return (
              <div
                key={gacha.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-200 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    {gacha.cover_image ? (
                      <img
                        src={gacha.cover_image}
                        alt={gacha.title}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-300"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-black text-sm border-2 border-amber-300">
                        ６-３
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900">
                          {gacha.title}
                        </h2>
                        {isComplete && (
                          <span className="bg-yellow-400 text-slate-900 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                            <Sparkles size={11} />
                            <span>COMPLETE!</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {collectedInThis} / {gachaItems.length} 種 コンプリート率: {rate}%
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/play?id=${gacha.id}`}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 text-white font-black text-xs shadow-md transition-transform active:scale-95"
                  >
                    このガチャを回す！
                  </Link>
                </div>

                {/* 景品グリッド */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {gachaItems.map((item) => {
                    const collection = userCollections[item.id];
                    const isCollected = Boolean(collection);
                    const r = RARITY_INFO[item.rarity];

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItemDetail(item)}
                        className={`relative rounded-2xl p-3 flex flex-col items-center justify-between text-center transition-all cursor-pointer border-2 ${
                          isCollected
                            ? `bg-gradient-to-b ${r.bgGradient} ${r.borderColor} hover:scale-105 shadow-md`
                            : 'bg-slate-100 border-dashed border-slate-300 opacity-60 hover:opacity-80'
                        }`}
                      >
                        {/* 獲得回数バッジ */}
                        {isCollected && (
                          <span className="absolute top-2 right-2 bg-amber-500 text-white font-black text-[10px] px-2 py-0.2 rounded-full shadow">
                            x{collection.count}
                          </span>
                        )}

                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full mb-2 ${
                            isCollected ? r.badgeBg : 'bg-slate-400 text-white'
                          }`}
                        >
                          {item.rarity}
                        </span>

                        {/* アイテム画像またはロック */}
                        <div className="my-2 h-16 w-16 flex items-center justify-center rounded-xl overflow-hidden">
                          {isCollected ? (
                            item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <div className="w-full h-full bg-white/80 rounded-xl flex items-center justify-center font-black text-xs text-amber-800 border border-amber-200">
                                {item.rarity}
                              </div>
                            )
                          ) : (
                            <div className="w-full h-full bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                              <Lock size={20} />
                            </div>
                          )}
                        </div>

                        <div className="w-full">
                          <h4 className="text-xs font-black text-slate-900 truncate">
                            {isCollected ? (
                              item.name
                            ) : item.is_secret ? (
                              '??? (シークレット)'
                            ) : (
                              item.name
                            )}
                          </h4>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {isCollected ? item.description : 'まだ当たっていません'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 詳細モーダル */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-300 text-center">
            <button
              onClick={() => setSelectedItemDetail(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              ✕
            </button>

            {(() => {
              const item = selectedItemDetail;
              const collection = userCollections[item.id];
              const isCollected = Boolean(collection);
              const r = RARITY_INFO[item.rarity];
              const itemReactions = reactions[item.id] || {};

              return (
                <div>
                  <span className={`inline-block text-xs font-black px-3 py-1 rounded-full mb-3 ${r.badgeBg}`}>
                    {r.label}
                  </span>

                  <div className="w-28 h-28 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-3 border-2 border-amber-200 overflow-hidden">
                    {isCollected ? (
                      item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-black text-xl text-amber-800">{item.rarity}</span>
                      )
                    ) : (
                      <span className="text-3xl text-slate-400">❓</span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mb-1">
                    {isCollected ? item.name : item.is_secret ? '??? (シークレットアイテム)' : item.name}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {isCollected
                      ? item.description
                      : 'まだ獲得していません！ガチャを回して当ててみよう！'}
                  </p>

                  {isCollected && (
                    <div className="bg-slate-50 rounded-xl p-2.5 mb-4 text-xs text-slate-500 space-y-1">
                      <p>獲得回数: <strong className="text-slate-800">{collection.count}回</strong></p>
                      <p>初獲得: {new Date(collection.firstObtainedAt).toLocaleDateString()}</p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-[11px] font-bold text-slate-500 mb-2">
                      絵文字で評価する:
                    </p>
                    <div className="flex justify-center gap-1.5">
                      {EMOJI_LIST.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiClick(item.id, emoji)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-xs font-bold transition-colors"
                        >
                          <span>{emoji}</span>
                          <span className="text-[10px] text-slate-600">
                            {itemReactions[emoji] || 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
