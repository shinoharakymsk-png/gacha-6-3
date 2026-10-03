'use client';

import React, { useState, useEffect } from 'react';
import { Gacha, GachaItem } from '@/types';
import { getGachas, recordObtainedItem, incrementPlayCount, getCategories } from '@/lib/storage';
import { Navbar } from '@/components/Navbar';
import { CapsuleMachine } from '@/components/CapsuleMachine';
import { ResultModal } from '@/components/ResultModal';
import { WeatherBackground } from '@/components/WeatherBackground';
import { Search, Sparkles, Layers, ArrowLeft, RotateCw, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function PlayPage() {
  const [gachas, setGachas] = useState<Gacha[]>([]);
  const [selectedGacha, setSelectedGacha] = useState<Gacha | null>(null);
  const [activeTab, setActiveTab] = useState<'machine' | 'search'>('machine');

  // 検索用ステート
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [categories, setCategories] = useState<string[]>([]);

  // 結果モーダル
  const [resultItems, setResultItems] = useState<GachaItem[]>([]);
  const [isMultiResult, setIsMultiResult] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const list = await getGachas();
    setGachas(list);
    setCategories(['すべて', ...getCategories()]);

    if (list.length > 0) {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const gachaId = params.get('id');
        const found = list.find((g) => g.id === gachaId);
        setSelectedGacha(found || list[0]);
      } else {
        setSelectedGacha(list[0]);
      }
    }
  };

  const handleDrawComplete = async (items: GachaItem[], isMulti: boolean) => {
    if (!selectedGacha) return;

    items.forEach((item) => {
      recordObtainedItem(item);
    });

    await incrementPlayCount(selectedGacha.id, items.length);

    setResultItems(items);
    setIsMultiResult(isMulti);
    setIsResultOpen(true);

    const list = await getGachas();
    setGachas(list);
    setSelectedGacha(list.find((g) => g.id === selectedGacha.id) || selectedGacha);
  };

  const handleSelectGachaToPlay = (gacha: Gacha) => {
    setSelectedGacha(gacha);
    setActiveTab('machine');
  };

  // 検索フィルタリング
  const filteredGachas = gachas.filter((g) => {
    const matchCat = selectedCategory === 'すべて' || g.category === selectedCategory;
    const matchQuery =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  return (
    <div className="min-h-screen text-slate-800 flex flex-col selection:bg-amber-300 relative">
      <WeatherBackground />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 flex flex-col">
        {/* 上部タブ切替バー */}
        <div className="flex items-center justify-between gap-4 mb-6 border-b-2 border-amber-200 pb-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>ホームへ戻る</span>
          </Link>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('machine')}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-2xl text-xs font-black transition-all shadow-xs ${
                activeTab === 'machine'
                  ? 'bg-red-500 text-white shadow-red-500/30'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span>🎰 ガチャポン自販機</span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-2xl text-xs font-black transition-all shadow-xs ${
                activeTab === 'search'
                  ? 'bg-amber-500 text-white shadow-amber-500/30'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Search size={14} />
              <span>🔍 ガチャを検索する</span>
            </button>
          </div>
        </div>

        {/* タブ1: ガチャポン自販機（自販機だけを画面中央に配置） */}
        {activeTab === 'machine' && (
          <div className="flex-1 flex flex-col items-center justify-center my-4">
            {selectedGacha ? (
              <div className="w-full flex flex-col items-center">
                {/* 現在セット中のガチャタイトル */}
                <div className="text-center mb-6 max-w-md">
                  <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 font-black text-xs px-3 py-1 rounded-full mb-2 border border-amber-200">
                    <Sparkles size={13} />
                    <span>セット中: {selectedGacha.category || '学校生活'}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {selectedGacha.title}
                  </h1>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {selectedGacha.description}
                  </p>

                  <button
                    onClick={() => setActiveTab('search')}
                    className="mt-2 text-xs font-bold text-amber-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>別のガチャを検索してセットする ➔</span>
                  </button>
                </div>

                {/* ガチャ自販機 */}
                <CapsuleMachine
                  gacha={selectedGacha}
                  onDrawComplete={handleDrawComplete}
                />
              </div>
            ) : (
              <div className="text-center py-16 bg-white/90 backdrop-blur-md rounded-3xl p-8 border-2 border-dashed border-amber-300 max-w-md shadow-lg">
                <span className="text-4xl block mb-3">🎒</span>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  まだガチャが登録されていません
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  記念すべき最初のガチャを作って、教室のみんなに回してもらおう！
                </p>
                <Link
                  href="/create"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md inline-flex items-center gap-2"
                >
                  <PlusCircle size={16} />
                  <span>ガチャを作る画面へ</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* タブ2: ガチャを検索する（検索のみ） */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border-4 border-amber-200 shadow-md">
              <h2 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
                <Search className="text-amber-500" size={20} />
                <span>ガチャ検索</span>
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                キーワードやカテゴリでガチャを検索して、マシンにセットしよう！
              </p>

              {/* 検索入力 */}
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="ガチャ名・景品名・作者名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-amber-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              {/* カテゴリフィルタ */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-amber-100 text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 検索結果リスト */}
            <div className="space-y-3">
              <div className="text-xs font-black text-slate-500 px-2">
                検索結果: {filteredGachas.length}件
              </div>

              {filteredGachas.length > 0 ? (
                filteredGachas.map((gacha) => {
                  const isCurrent = selectedGacha?.id === gacha.id;
                  return (
                    <div
                      key={gacha.id}
                      className={`p-4 rounded-3xl border-2 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md ${
                        isCurrent ? 'border-amber-500 ring-2 ring-amber-300' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {gacha.cover_image ? (
                          <img
                            src={gacha.cover_image}
                            alt={gacha.title}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-black text-sm border border-amber-200">
                            ６-３
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                              {gacha.category}
                            </span>
                            <span className="text-xs text-slate-400 font-bold">
                              全{gacha.items.length}種 / プレイ{gacha.play_count || 0}回
                            </span>
                          </div>
                          <h3 className="font-black text-base text-slate-900">{gacha.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-1">{gacha.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectGachaToPlay(gacha)}
                        className={`px-5 py-2.5 rounded-2xl font-black text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 ${
                          isCurrent
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-500 hover:bg-red-400 text-white'
                        }`}
                      >
                        <span>{isCurrent ? '✓ セット中 (回す)' : 'このガチャをセットして回す'}</span>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-300">
                  <p className="text-xs font-bold text-slate-400">
                    一致するガチャが見つかりませんでした。
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <ResultModal
        isOpen={isResultOpen}
        onClose={() => setIsResultOpen(false)}
        items={resultItems}
        isMulti={isMultiResult}
        onSpinAgain={() => {
          if (selectedGacha) {
            handleDrawComplete(
              isMultiResult ? selectedGacha.items : [selectedGacha.items[0]],
              isMultiResult
            );
          }
        }}
      />
    </div>
  );
}
