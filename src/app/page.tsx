'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gacha,
  FortuneHistoryRecord,
  AttendanceWallet,
  ItemReaction,
} from '@/types';
import {
  getGachas,
  getTodayUserFortune,
  getFortuneHistory,
  getWallet,
  claimDailyBonus,
  getReactions,
} from '@/lib/storage';
import { checkFeverStatus, FeverStatus } from '@/lib/fever';
import { Navbar } from '@/components/Navbar';
import { DailyFortuneModal } from '@/components/DailyFortuneModal';
import { SupabaseSettingsModal } from '@/components/SupabaseSettingsModal';
import { WeatherBackground } from '@/components/WeatherBackground';
import {
  Play,
  PlusCircle,
  Trophy,
  Calendar,
  Sun,
  Sparkles,
  BookOpen,
  Award,
  ChevronRight,
  Flame,
  Repeat,
  Clock,
} from 'lucide-react';
import { RARITY_INFO } from '@/lib/gachaLogic';

export default function HomePage() {
  const [gachas, setGachas] = useState<Gacha[]>([]);
  const [wallet, setWallet] = useState<AttendanceWallet>({ seals: [], lastDailyClaimDate: '' });
  const [todayFortune, setTodayFortune] = useState<FortuneHistoryRecord | null>(null);
  const [fortuneHistory, setFortuneHistory] = useState<FortuneHistoryRecord[]>([]);
  const [reactions, setReactions] = useState<ItemReaction>({});
  const [fever, setFever] = useState<FeverStatus>({ isAvailableTime: true, isFeverActive: false, multiplier: 1 });

  // タブ: 'ranking' | 'renrakucho'
  const [activeTab, setActiveTab] = useState<'ranking' | 'renrakucho'>('ranking');

  // モーダル
  const [isFortuneModalOpen, setIsFortuneModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dailyBonusClaimedMsg, setDailyBonusClaimedMsg] = useState(false);

  useEffect(() => {
    loadData();
    setFever(checkFeverStatus());
    const interval = setInterval(() => {
      setFever(checkFeverStatus());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const list = await getGachas();
    setGachas(list);
    setReactions(getReactions());

    const bonus = claimDailyBonus();
    setWallet(bonus.wallet);
    if (bonus.claimed) {
      setDailyBonusClaimedMsg(true);
      setTimeout(() => setDailyBonusClaimedMsg(false), 5000);
    }

    const fortuneRecord = getTodayUserFortune();
    setTodayFortune(fortuneRecord);
    setFortuneHistory(getFortuneHistory());

    if (!fortuneRecord) {
      setTimeout(() => {
        setIsFortuneModalOpen(true);
      }, 700);
    }
  };

  const popularGachas = [...gachas].sort((a, b) => (b.play_count || 0) - (a.play_count || 0)).slice(0, 5);

  const allItems = gachas.flatMap((g) => g.items.map((i) => ({ ...i, gachaTitle: g.title })));
  const ratedItems = allItems
    .map((item) => {
      const itemReactions = reactions[item.id] || {};
      const totalEmoji = Object.values(itemReactions).reduce((sum, count) => sum + count, 0);
      return { ...item, totalEmoji };
    })
    .sort((a, b) => b.totalEmoji - a.totalEmoji)
    .slice(0, 5);

  return (
    <div className="min-h-screen text-slate-800 flex flex-col selection:bg-amber-300 relative">
      {/* リアルタイム動的背景 */}
      <WeatherBackground />

      <Navbar
        onOpenFortune={() => setIsFortuneModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-8">
        {/* 出席シール ＆ ログインボーナス通知 */}
        {dailyBonusClaimedMsg && (
          <div className="p-3 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-2xl text-amber-950 font-black text-xs shadow-md border-2 border-amber-500 flex items-center justify-between animate-drop">
            <div className="flex items-center gap-2">
              <span className="text-xl">💮</span>
              <span>
                本日の出席シールGET！ 登校スタンプが記録されました！
              </span>
            </div>
            <span className="text-[10px] bg-white/70 px-2 py-0.5 rounded-full font-bold">登校完了</span>
          </div>
        )}

        {/* 門限・フィーバータイム告知 */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-amber-200 shadow-sm text-xs">
          <div className="flex items-center gap-2">
            {fever.isFeverActive ? (
              <>
                <Flame size={18} className="text-red-600 animate-bounce" />
                <span className="font-black text-red-600">
                  🔥 フィーバータイム発動中！SSR・UR出現率2倍！
                </span>
              </>
            ) : !fever.isAvailableTime ? (
              <>
                <Clock size={16} className="text-indigo-600" />
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  🌙 下校時刻です（21:00〜8:00は門限のためフィーバーはお休みです）
                </span>
              </>
            ) : (
              <>
                <Flame size={16} className="text-slate-400" />
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  通常モード（8:00〜21:00の間、ランダムでフィーバー発生！）
                </span>
              </>
            )}
          </div>
          <span className="text-[10px] font-bold text-slate-400">8:00〜21:00 限定</span>
        </div>

        {/* 黒板ウェルカムヘッダー */}
        <section className="chalkboard-bg p-6 sm:p-8 text-white relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md mb-3">
                <span>🏫 ６年３組 ガチャ広場</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black chalk-text mb-2 tracking-wide">
                ６年３組ガチャへようこそ！
              </h1>
              <p className="chalk-text-pink text-xs sm:text-sm max-w-md leading-relaxed">
                今日はどのガチャを回す？それとも新しいガチャを作る？
                懐かしい学校生活の思い出をみんなで楽しもう！
              </p>
            </div>

            {/* 今日の運勢ミニ黒板カード */}
            <div className="w-full md:w-72 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shadow-lg flex-shrink-0">
              <div className="flex items-center justify-between text-xs text-yellow-300 font-bold mb-2">
                <span className="flex items-center gap-1">
                  <Sun size={14} />
                  <span>今日の運勢</span>
                </span>
                <button
                  onClick={() => setIsFortuneModalOpen(true)}
                  className="text-[11px] underline text-emerald-200 hover:text-white"
                >
                  {todayFortune ? 'もう一度見る' : '今すぐ占う'}
                </button>
              </div>

              {todayFortune ? (
                <div className="space-y-1.5">
                  <div className="inline-block bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-black text-lg px-4 py-0.5 rounded-full shadow">
                    {todayFortune.fortune.fortune_rank}
                  </div>
                  <p className="text-xs text-emerald-100 line-clamp-2">
                    {todayFortune.fortune.message}
                  </p>
                  <p className="text-[10px] text-yellow-300 font-medium">
                    幸運具: {todayFortune.fortune.lucky_item}
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  <p className="text-xs text-emerald-200 mb-2">
                    今日の運勢はまだ引いていません！
                  </p>
                  <button
                    onClick={() => setIsFortuneModalOpen(true)}
                    className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow transition-transform active:scale-95"
                  >
                    🎲 今日の運勢を占う
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 出席スタンプステータスバー */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-4 border-2 border-amber-200 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 font-black text-xl">
              💮
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">今月の出席シール</span>
              <span className="text-base font-black text-rose-600 font-mono">
                {wallet.seals.length} <span className="text-xs font-normal text-slate-600">日分</span>
              </span>
            </div>
          </div>

          <span className="text-[11px] font-bold text-slate-400">
            毎日の登校でシールGET！
          </span>
        </div>

        {/* ★ メイン２択：【回す】と【作る】★ */}
        <section className="py-2">
          <div className="text-center mb-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              SELECT MODE
            </span>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">
              モードを選んで遊ぼう！
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 回す */}
            <Link
              href="/play"
              className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-red-600 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border-4 border-red-700 flex flex-col justify-between min-h-[220px]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl mb-4 group-hover:rotate-12 transition-transform shadow-inner">
                  🎰
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-wide mb-2 flex items-center gap-2">
                  <span>回す</span>
                  <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs sm:text-sm text-red-100 leading-relaxed font-medium">
                  ガチャポン自販機でガチャを回そう！
                  カプセルの溜め演出（通常・レア・激アツ大爆発）やコロコロ動く自販機を体験！
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs font-bold text-red-200">
                <span>自販機 ＆ 検索へ</span>
                <span className="bg-white text-red-600 px-3 py-1 rounded-full font-black text-xs shadow-md group-hover:scale-105 transition-transform">
                  今すぐ回す ➔
                </span>
              </div>
            </Link>

            {/* 作る */}
            <Link
              href="/create"
              className="group relative overflow-hidden bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-8 text-amber-950 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all border-4 border-amber-600 flex flex-col justify-between min-h-[220px]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center text-3xl mb-4 group-hover:rotate-12 transition-transform shadow-inner">
                  ✏️
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-wide mb-2 flex items-center gap-2">
                  <span>作る</span>
                  <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                  オリジナルガチャを作ろう！
                  自由なカテゴリ追加、写真アップロード、出現率設定、マイガチャ管理（編集・削除）ができます。
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-amber-900/20 flex items-center justify-between text-xs font-bold text-amber-900">
                <span>作成 ＆ マイガチャ管理へ</span>
                <span className="bg-amber-950 text-white px-3 py-1 rounded-full font-black text-xs shadow-md group-hover:scale-105 transition-transform">
                  今すぐ作る ➔
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* クラスの広場メニュー（トレード・図鑑） */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/trade"
            className="p-5 rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">
              🔄
            </div>
            <div>
              <span className="text-[10px] bg-white/30 text-white font-black px-2 py-0.2 rounded-full">
                こうかんこ
              </span>
              <h3 className="font-black text-base mt-0.5">トレード広場</h3>
              <p className="text-[10px] text-purple-100">ダブった景品を交換しよう！</p>
            </div>
          </Link>

          <Link
            href="/collection"
            className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-500 text-slate-950 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/30 flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">
              📖
            </div>
            <div>
              <span className="text-[10px] bg-amber-950 text-white font-black px-2 py-0.2 rounded-full">
                コレクション
              </span>
              <h3 className="font-black text-base mt-0.5">ガチャ図鑑</h3>
              <p className="text-[10px] text-amber-900">集めた景品とコンプリート率！</p>
            </div>
          </Link>
        </section>

        {/* ランキング / 連絡帳 */}
        <section className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-4 border-amber-200 shadow-lg">
          <div className="flex items-center justify-between gap-4 mb-6 border-b-2 border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('ranking')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                  activeTab === 'ranking'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Trophy size={14} />
                <span>🏆 ランキング</span>
              </button>

              <button
                onClick={() => setActiveTab('renrakucho')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all ${
                  activeTab === 'renrakucho'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Calendar size={14} />
                <span>📅 連絡帳（運勢履歴）</span>
              </button>
            </div>
          </div>

          {activeTab === 'ranking' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
                  <Flame className="text-rose-500" size={16} />
                  <span>人気ガチャ TOP5 (プレイ回数)</span>
                </h3>
                <div className="space-y-2">
                  {popularGachas.length > 0 ? (
                    popularGachas.map((g, idx) => (
                      <Link
                        key={g.id}
                        href={`/play?id=${g.id}`}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                              idx === 0
                                ? 'bg-yellow-400 text-slate-950 shadow-xs'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-900'
                                : idx === 2
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{g.title}</h4>
                            <span className="text-[10px] text-slate-400 font-medium">作者: {g.author_name}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-black text-rose-600">{g.play_count || 0}回</span>
                      </Link>
                    ))
                  ) : (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                      まだガチャがありません。最初のガチャを作ってみよう！
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
                  <Award className="text-amber-500" size={16} />
                  <span>人気景品 TOP5 (絵文字評価数)</span>
                </h3>
                <div className="space-y-2">
                  {ratedItems.length > 0 ? (
                    ratedItems.map((item, idx) => {
                      const r = RARITY_INFO[item.rarity];
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                                idx === 0
                                  ? 'bg-yellow-400 text-slate-950 shadow-xs'
                                  : idx === 1
                                  ? 'bg-slate-300 text-slate-900'
                                  : idx === 2
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${r.badgeBg}`}>
                                  {item.rarity}
                                </span>
                                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</h4>
                              </div>
                              <span className="text-[10px] text-slate-400 line-clamp-1">{item.gachaTitle}</span>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-black text-amber-600 flex items-center gap-1">
                            <span>👏</span>
                            <span>{item.totalEmoji}</span>
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                      まだ評価された景品がありません。
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'renrakucho' && (
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>📘 ６年３組 毎日の連絡帳（おみくじ記録）</span>
                </h3>
                <p className="text-xs text-slate-500">これまで登校して引いた今日の運勢の記録です。</p>
              </div>

              {fortuneHistory.length > 0 ? (
                <div className="space-y-3">
                  {fortuneHistory.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-xl bg-white border border-amber-300 text-xs font-mono font-bold text-amber-900 shadow-xs">
                          📅 {record.date}
                        </span>
                        <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-xs shadow-xs">
                          {record.fortune.fortune_rank}
                        </span>
                        <p className="text-xs text-slate-700 font-medium line-clamp-1">{record.fortune.message}</p>
                      </div>
                      <span className="text-xs text-amber-800 font-bold whitespace-nowrap">
                        幸運具: {record.fortune.lucky_item}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-400 mb-2">まだ連絡帳の記録がありません。</p>
                  <button
                    onClick={() => setIsFortuneModalOpen(true)}
                    className="px-4 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-xs"
                  >
                    今日の運勢を引く
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-amber-100/60 dark:bg-slate-900/60 border-t-2 border-amber-200 py-6 text-center text-xs text-slate-500">
        <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">🎒 ６年３組ガチャ</p>
        <p>Supabase × Vercel 対応 Web ガチャガチャプラットフォーム</p>
      </footer>

      <DailyFortuneModal
        isOpen={isFortuneModalOpen}
        onClose={() => {
          setIsFortuneModalOpen(false);
          setTodayFortune(getTodayUserFortune());
          setFortuneHistory(getFortuneHistory());
        }}
        onFortuneDrawn={(fortune) => {
          const newRecord = {
            id: `history-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            fortune,
          };
          setTodayFortune(newRecord);
          setFortuneHistory(getFortuneHistory());
        }}
      />

      <SupabaseSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
