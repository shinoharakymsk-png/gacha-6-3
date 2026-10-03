'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { TradeListing, GachaItem, UserCollectionItem, Gacha } from '@/types';
import {
  getTrades,
  createTrade,
  completeTrade,
  getGachas,
  getUserCollections,
  consumeCollectionItem,
} from '@/lib/storage';
import { RARITY_INFO, playSoundEffect } from '@/lib/gachaLogic';
import { WeatherBackground } from '@/components/WeatherBackground';
import { ArrowLeft, Repeat, Plus, CheckCircle2, User, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function TradePage() {
  const [trades, setTrades] = useState<TradeListing[]>([]);
  const [gachas, setGachas] = useState<Gacha[]>([]);
  const [collections, setCollections] = useState<Record<string, UserCollectionItem>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 出品ステート
  const [selectedItemId, setSelectedItemId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [wantedNote, setWantedNote] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setTrades(getTrades());
    const gList = await getGachas();
    setGachas(gList);
    setCollections(getUserCollections());
  };

  // 所持アイテム一覧の取得
  const allGachaItems = gachas.flatMap((g) => g.items);
  const myItems = allGachaItems.filter((item) => collections[item.id] && collections[item.id].count > 0);

  // 出品処理
  const handleCreateTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      alert('出品するアイテムを選択してください！');
      return;
    }
    const targetItem = allGachaItems.find((i) => i.id === selectedItemId);
    if (!targetItem) return;

    // 手持ちから1個消費
    if (!consumeCollectionItem(targetItem.id)) {
      alert('アイテムの所持数が足りません！');
      return;
    }

    const newTrade: TradeListing = {
      id: `trade-${Date.now()}`,
      offeredItem: targetItem,
      wantedItemName: wantedNote.trim() || 'なんでもOK！',
      ownerName: ownerName.trim() || '６年３組 仲間',
      createdAt: new Date().toLocaleDateString(),
      status: 'OPEN',
    };

    playSoundEffect('rare');
    createTrade(newTrade);
    setIsModalOpen(false);
    setSelectedItemId('');
    setWantedNote('');
    loadData();
  };

  // 交換成立処理
  const handleAcceptTrade = (trade: TradeListing) => {
    if (myItems.length === 0) {
      alert('交換に出せるアイテムを持っていません！ガチャを回してアイテムをゲットしよう！');
      return;
    }

    // 自分のアイテムを1つ差し出す（最初のアイテムなど）
    const itemToGive = myItems[0];
    if (!confirm(`【${trade.offeredItem.name}】と、あなたの【${itemToGive.name}】をこうかんしますか？`)) {
      return;
    }

    consumeCollectionItem(itemToGive.id);
    completeTrade(trade.id, trade.offeredItem);
    playSoundEffect('rare');
    alert(`🎉 【${trade.offeredItem.name}】を手に入れました！図鑑に追加されました！`);
    loadData();
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col selection:bg-amber-300 relative">
      <WeatherBackground />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>ホームへ戻る</span>
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-200 shadow-md mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-900 font-black text-xs px-3 py-1 rounded-full mb-2">
              <Repeat size={14} />
              <span>放課後のこうかんこ広場</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
              トレード広場
            </h1>
            <p className="text-xs text-slate-500">
              ダブった景品を出品して、クラスメイトの欲しい景品とこうかんしよう！
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>アイテムを出品する</span>
          </button>
        </div>

        {/* トレード出品一覧 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-xs font-black text-slate-500">
            <span>現在受付中のトレード ({trades.filter((t) => t.status === 'OPEN').length}件)</span>
          </div>

          {trades.length > 0 ? (
            trades.map((trade) => {
              const r = RARITY_INFO[trade.offeredItem.rarity] || RARITY_INFO.N;
              const isClosed = trade.status === 'COMPLETED';

              return (
                <div
                  key={trade.id}
                  className={`p-5 rounded-3xl border-2 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isClosed ? 'opacity-50 border-slate-200' : 'border-purple-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* アイテム画像 */}
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {trade.offeredItem.image_url ? (
                        <img
                          src={trade.offeredItem.image_url}
                          alt={trade.offeredItem.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-black text-sm text-slate-400">{trade.offeredItem.rarity}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-black px-2 py-0.2 rounded-full ${r.badgeBg}`}>
                          {trade.offeredItem.rarity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          出品者: {trade.ownerName} ({trade.createdAt})
                        </span>
                      </div>

                      <h3 className="font-black text-base text-slate-900">{trade.offeredItem.name}</h3>

                      <div className="flex items-center gap-1 text-xs text-purple-700 font-bold mt-1">
                        <ArrowRight size={12} />
                        <span>希望: {trade.wantedItemName}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isClosed ? (
                      <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-black text-xs">
                        こうかん成立済み
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcceptTrade(trade)}
                        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                      >
                        <Repeat size={14} />
                        <span>こうかんする！</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-purple-200">
              <p className="text-xs font-bold text-slate-500 mb-2">
                現在出品されているアイテムはありません。
              </p>
              <p className="text-[11px] text-slate-400">
                ガチャを回してダブったアイテムを出品してみよう！
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 出品モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-purple-300">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Repeat className="text-purple-600" size={18} />
              <span>アイテムを出品する</span>
            </h3>

            {myItems.length > 0 ? (
              <form onSubmit={handleCreateTrade} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    出品するアイテムを選択
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  >
                    <option value="">-- アイテムを選択 --</option>
                    {myItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        [{item.rarity}] {item.name} (所持: {collections[item.id]?.count || 0}個)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    希望する条件・メッセージ
                  </label>
                  <input
                    type="text"
                    placeholder="例: SSR以上なら何でも！ / 揚げパン探してます"
                    value={wantedNote}
                    onChange={(e) => setWantedNote(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    あなたのお名前
                  </label>
                  <input
                    type="text"
                    placeholder="例: ６年３組 タカシ"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md transition-all active:scale-95"
                  >
                    こうかんこ広場に出品！
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-3">出品できるアイテムをまだ持っていません！</p>
                <Link
                  href="/play"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-black text-xs shadow-xs"
                >
                  ガチャを回しに行く
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
