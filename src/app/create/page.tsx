'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Gacha, GachaItem, Rarity, DailyFortune } from '@/types';
import {
  saveGacha,
  getGachas,
  deleteGacha,
  saveFortune,
  getCategories,
  addCategory,
} from '@/lib/storage';
import { RARITY_INFO, drawGachaItem, playSoundEffect } from '@/lib/gachaLogic';
import { ResultModal } from '@/components/ResultModal';
import { WeatherBackground } from '@/components/WeatherBackground';
import {
  Plus,
  Trash2,
  Sparkles,
  Sliders,
  Check,
  Eye,
  Sun,
  Layers,
  Upload,
  Image as ImageIcon,
  FolderPlus,
  Edit3,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

const FORTUNE_RANKS = ['超大吉', '大吉', '中吉', '小吉', '吉', '凶', '大凶'];

export default function CreatePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'create_gacha' | 'my_gachas' | 'fortune'>('create_gacha');

  // ---------- カテゴリ関連 ----------
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // ---------- ガチャ編集用 ----------
  const [editingGachaId, setEditingGachaId] = useState<string | null>(null);

  // ---------- ガチャ作成ステート ----------
  const [gachaTitle, setGachaTitle] = useState('');
  const [gachaDescription, setGachaDescription] = useState('');
  const [gachaCategory, setGachaCategory] = useState('学校生活');
  const [coverImageBase64, setCoverImageBase64] = useState<string | undefined>(undefined);
  const [authorName, setAuthorName] = useState('');

  const [items, setItems] = useState<Omit<GachaItem, 'id' | 'gacha_id'>[]>([
    {
      name: '幻のきなこ揚げパン',
      description: '給食のおかわりじゃんけんで勝ち取った伝説の逸品。',
      rarity: 'UR',
      weight: 5,
      is_secret: false,
    },
    {
      name: 'たいへんよくできました花丸',
      description: '連絡帳に大きく書いてもらえる二重丸。',
      rarity: 'SSR',
      weight: 15,
      is_secret: false,
    },
    {
      name: '短くなった赤鉛筆',
      description: 'キャップをつなげてギリギリまで使い切った証。',
      rarity: 'N',
      weight: 80,
      is_secret: false,
    },
  ]);

  // ---------- 運勢作成ステート ----------
  const [fortuneRank, setFortuneRank] = useState('大吉');
  const [fortuneMessage, setFortuneMessage] = useState('');
  const [luckyItem, setLuckyItem] = useState('');
  const [fortuneWeight, setFortuneWeight] = useState(20);
  const [fortuneAuthor, setFortuneAuthor] = useState('');
  const [fortuneSavedMsg, setFortuneSavedMsg] = useState(false);

  // ---------- マイガチャ管理 ----------
  const [myGachas, setMyGachas] = useState<Gacha[]>([]);

  // ---------- テストプレイ用 ----------
  const [testResult, setTestResult] = useState<GachaItem[]>([]);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategoriesAndGachas();
  }, []);

  const loadCategoriesAndGachas = async () => {
    const cats = getCategories();
    setCategories(cats);
    if (cats.length > 0 && !gachaCategory) {
      setGachaCategory(cats[0]);
    }
    const all = await getGachas();
    setMyGachas(all);
  };

  // 画像アップロード用ヘルパー
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (base64: string | undefined) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 2MB以内チェック
    if (file.size > 2 * 1024 * 1024) {
      alert('画像サイズは2MB以内にしてください。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      callback(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 新規カテゴリ追加
  const handleAddNewCategory = () => {
    if (!newCategoryInput.trim()) return;
    const updated = addCategory(newCategoryInput.trim());
    setCategories(updated);
    setGachaCategory(newCategoryInput.trim());
    setNewCategoryInput('');
    setIsAddingCategory(false);
  };

  // 景品アイテム操作
  const handleAddItem = () => {
    playSoundEffect('click');
    setItems([
      ...items,
      {
        name: '',
        description: '',
        rarity: 'R',
        weight: 20,
        is_secret: false,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    playSoundEffect('click');
    if (items.length <= 1) {
      alert('景品は最低1つ以上必要です！');
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleUpdateItem = (index: number, field: string, value: unknown) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  // 出現率の自動100%均等調整
  const handleAutoBalanceWeights = () => {
    playSoundEffect('click');
    if (items.length === 0) return;
    const baseWeight = Math.floor(100 / items.length);
    const remainder = 100 - baseWeight * items.length;

    const balanced = items.map((item, idx) => ({
      ...item,
      weight: baseWeight + (idx === 0 ? remainder : 0),
    }));
    setItems(balanced);
  };

  const totalWeight = items.reduce((sum, item) => sum + (Number(item.weight) || 1), 0);

  // テストプレイ
  const handleTestPlay = () => {
    if (items.length === 0) return;
    const dummyGachaId = 'temp-test';
    const completeItems: GachaItem[] = items.map((item, idx) => ({
      ...item,
      id: `test-item-${idx}`,
      gacha_id: dummyGachaId,
      weight: Number(item.weight) || 1,
    }));

    const drawn = drawGachaItem(completeItems);
    setTestResult([drawn]);
    setIsTestModalOpen(true);
  };

  // ガチャ公開・保存（新規 or 編集）
  const handleSaveGacha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gachaTitle.trim()) {
      alert('ガチャ名を入力してください！');
      return;
    }
    for (let i = 0; i < items.length; i++) {
      if (!items[i].name.trim()) {
        alert(`景品 ${i + 1} の名前を入力してください！`);
        return;
      }
    }

    setIsSaving(true);
    playSoundEffect('rare');

    const gachaId = editingGachaId || `gacha-${Date.now()}`;
    const completeItems: GachaItem[] = items.map((item, idx) => ({
      ...item,
      id: `item-${gachaId}-${idx}`,
      gacha_id: gachaId,
      weight: Number(item.weight) || 1,
    }));

    const gachaData: Gacha = {
      id: gachaId,
      title: gachaTitle.trim(),
      description: gachaDescription.trim() || '６年３組の仲間が作ったガチャ！',
      category: gachaCategory,
      cover_image: coverImageBase64,
      author_name: authorName.trim() || '６年３組 仲間',
      play_count: 0,
      created_at: new Date().toISOString(),
      is_user_created: true,
      items: completeItems,
    };

    await saveGacha(gachaData);
    setIsSaving(false);
    alert(editingGachaId ? '🎉 ガチャを更新しました！' : '🎉 新しいガチャが完成しました！');
    setEditingGachaId(null);
    router.push(`/play?id=${gachaId}`);
  };

  // 編集モードに入る
  const handleEditGacha = (gacha: Gacha) => {
    setEditingGachaId(gacha.id);
    setGachaTitle(gacha.title);
    setGachaDescription(gacha.description);
    setGachaCategory(gacha.category);
    setCoverImageBase64(gacha.cover_image);
    setAuthorName(gacha.author_name);
    setItems(
      gacha.items.map((i) => ({
        name: i.name,
        description: i.description,
        rarity: i.rarity,
        weight: i.weight,
        image_url: i.image_url,
        is_secret: i.is_secret,
      }))
    );
    setActiveTab('create_gacha');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ガチャ削除
  const handleDeleteGacha = async (gachaId: string) => {
    if (!confirm('このガチャを本当に削除しますか？')) return;
    await deleteGacha(gachaId);
    playSoundEffect('click');
    const updated = await getGachas();
    setMyGachas(updated);
  };

  // 今日の運勢保存
  const handleSaveFortune = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fortuneMessage.trim()) {
      alert('運勢メッセージを入力してください！');
      return;
    }
    const newFortune: DailyFortune = {
      id: `fortune-${Date.now()}`,
      fortune_rank: fortuneRank,
      message: fortuneMessage.trim(),
      lucky_item: luckyItem.trim() || '赤鉛筆',
      weight: Number(fortuneWeight) || 10,
      author_name: fortuneAuthor.trim() || '６年３組 占い係',
      created_at: new Date().toISOString(),
    };

    await saveFortune(newFortune);
    playSoundEffect('rare');
    setFortuneSavedMsg(true);
    setFortuneMessage('');
    setLuckyItem('');

    setTimeout(() => {
      setFortuneSavedMsg(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col selection:bg-amber-300 relative">
      <WeatherBackground />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
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

        {/* ヘッダー */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 font-black text-xs px-3 py-1 rounded-full mb-2">
            <span>✏️ 作るモード</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            {editingGachaId ? 'ガチャを編集する' : '新しいガチャ・運勢を作る'}
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            ガチャ名、説明、出現率を設定してオリジナルガチャを作成。
            自作したガチャの編集や削除もここで行えます。
          </p>
        </div>

        {/* タブ切り替え */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => {
              setEditingGachaId(null);
              setActiveTab('create_gacha');
            }}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-black text-xs transition-all shadow-xs ${
              activeTab === 'create_gacha'
                ? 'bg-amber-500 text-white shadow-amber-500/30 scale-105'
                : 'bg-white hover:bg-amber-100 text-slate-700 border border-amber-200'
            }`}
          >
            <Layers size={15} />
            <span>{editingGachaId ? 'ガチャを編集' : 'ガチャを作る'}</span>
          </button>

          <button
            onClick={() => {
              loadCategoriesAndGachas();
              setActiveTab('my_gachas');
            }}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-black text-xs transition-all shadow-xs ${
              activeTab === 'my_gachas'
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 scale-105'
                : 'bg-white hover:bg-emerald-100 text-slate-700 border border-emerald-200'
            }`}
          >
            <Edit3 size={15} />
            <span>マイガチャ管理 (編集・削除)</span>
          </button>

          <button
            onClick={() => setActiveTab('fortune')}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-black text-xs transition-all shadow-xs ${
              activeTab === 'fortune'
                ? 'bg-rose-500 text-white shadow-rose-500/30 scale-105'
                : 'bg-white hover:bg-rose-100 text-slate-700 border border-rose-200'
            }`}
          >
            <Sun size={15} />
            <span>今日の運勢を作る 🌟</span>
          </button>
        </div>

        {/* タブ1: ガチャを作る（または編集） */}
        {activeTab === 'create_gacha' && (
          <form onSubmit={handleSaveGacha} className="space-y-8">
            {/* STEP 1: 基本情報 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-200 shadow-lg">
              <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>ガチャの基本情報</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    ガチャ名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例: ６年３組 伝説の文房具ガチャ"
                    value={gachaTitle}
                    onChange={(e) => setGachaTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-amber-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    ガチャの説明
                  </label>
                  <textarea
                    rows={2}
                    placeholder="例: 机の引き出しの奥底に眠るお宝たちが集結！"
                    value={gachaDescription}
                    onChange={(e) => setGachaDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-amber-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* カテゴリ（追加可能） */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-slate-700">
                      カテゴリ
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(!isAddingCategory)}
                      className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1"
                    >
                      <FolderPlus size={12} />
                      <span>＋新しいカテゴリを追加</span>
                    </button>
                  </div>

                  {isAddingCategory ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="新しいカテゴリ名..."
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-amber-300 bg-white text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="px-3 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-xs"
                      >
                        追加
                      </button>
                    </div>
                  ) : (
                    <select
                      value={gachaCategory}
                      onChange={(e) => setGachaCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border-2 border-amber-200 bg-slate-50 text-sm font-bold focus:outline-none focus:border-amber-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    作成者名（ニックネーム）
                  </label>
                  <input
                    type="text"
                    placeholder="例: ６年３組 工作係"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-amber-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* カバー画像アップロード（画像なしOK、アイコン削除） */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    カバー画像（任意 / 画像がない場合はなしでOK）
                  </label>
                  <div className="flex items-center gap-4 p-3 bg-amber-50/60 rounded-2xl border-2 border-dashed border-amber-200">
                    {coverImageBase64 ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-amber-300 flex-shrink-0">
                        <img
                          src={coverImageBase64}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setCoverImageBase64(undefined)}
                          className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-rose-600"
                          title="画像を削除"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                        <ImageIcon size={20} />
                        <span className="text-[8px] font-bold mt-1">なし</span>
                      </div>
                    )}

                    <div className="flex-1 text-xs">
                      <input
                        type="file"
                        accept="image/*"
                        id="cover-upload"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, setCoverImageBase64)}
                      />
                      <label
                        htmlFor="cover-upload"
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-amber-300 font-bold text-amber-900 cursor-pointer shadow-xs"
                      >
                        <Upload size={14} />
                        <span>オリジナル画像を選択...</span>
                      </label>
                      <p className="text-[10px] text-slate-500 mt-1">
                        ※JPG, PNG, GIF対応（2MB以内）。画像なしでも作成できます。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: 景品アイテムの登録 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-amber-200 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    <span>景品アイテム登録（全{items.length}種）</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    景品名、説明、レアリティ、出現率を設定してください（画像は任意）。
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoBalanceWeights}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
                    title="各アイテムの確率を均等に100%に調整します"
                  >
                    <Sliders size={13} />
                    <span>確率を100%に自動調整</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-xs font-black px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all"
                  >
                    <Plus size={14} />
                    <span>景品を追加</span>
                  </button>
                </div>
              </div>

              {/* アイテムリスト */}
              <div className="space-y-4">
                {items.map((item, idx) => {
                  const ratePercent = ((Number(item.weight) / Math.max(1, totalWeight)) * 100).toFixed(1);
                  const rarityStyle = RARITY_INFO[item.rarity];

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-amber-50/40 transition-colors space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-slate-500">
                          景品 #{idx + 1}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-amber-700">
                            推定確率: {ratePercent}%
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                            title="削除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        {/* 景品画像アップロード（画像なしOK、アイコン削除） */}
                        <div className="sm:col-span-3 flex items-center gap-2">
                          <div className="relative w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.image_url ? (
                              <>
                                <img
                                  src={item.image_url}
                                  alt="Item preview"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItem(idx, 'image_url', undefined)}
                                  className="absolute top-0 right-0 bg-black/60 text-white text-[9px] p-0.5 rounded-full"
                                  title="削除"
                                >
                                  ✕
                                </button>
                              </>
                            ) : (
                              <ImageIcon size={18} className="text-slate-300" />
                            )}
                          </div>

                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              id={`item-image-${idx}`}
                              className="hidden"
                              onChange={(e) =>
                                handleImageUpload(e, (base64) =>
                                  handleUpdateItem(idx, 'image_url', base64)
                                )
                              }
                            />
                            <label
                              htmlFor={`item-image-${idx}`}
                              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-[10px] font-bold text-slate-700 cursor-pointer hover:bg-slate-50 inline-block shadow-xs"
                            >
                              画像選択
                            </label>
                          </div>
                        </div>

                        {/* 景品名 */}
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            required
                            placeholder="景品名 (例: 幻のきなこ揚げパン)"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 bg-white text-sm font-bold focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* レアリティ */}
                        <div className="sm:col-span-2">
                          <select
                            value={item.rarity}
                            onChange={(e) => handleUpdateItem(idx, 'rarity', e.target.value as Rarity)}
                            className={`w-full px-2 py-2 rounded-xl font-black text-xs border-2 border-slate-200 bg-white ${rarityStyle.textColor}`}
                          >
                            <option value="UR">UR (超激レア)</option>
                            <option value="SSR">SSR (激レア)</option>
                            <option value="SR">SR (レア)</option>
                            <option value="R">R (中レア)</option>
                            <option value="N">N (ノーマル)</option>
                          </select>
                        </div>

                        {/* 出現率重み */}
                        <div className="sm:col-span-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-slate-400">重み:</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={item.weight}
                              onChange={(e) => handleUpdateItem(idx, 'weight', Number(e.target.value))}
                              className="w-full px-2 py-2 rounded-xl border-2 border-slate-200 bg-white text-xs font-mono font-bold text-center"
                            />
                          </div>
                        </div>

                        {/* 景品説明 */}
                        <div className="sm:col-span-9">
                          <input
                            type="text"
                            placeholder="景品の説明文 (例: 給食じゃんけんで勝ち取った伝説の逸品)"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* シークレットチェック */}
                        <div className="sm:col-span-3 flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-xs text-slate-600 font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(item.is_secret)}
                              onChange={(e) => handleUpdateItem(idx, 'is_secret', e.target.checked)}
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>シークレット(???)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus size={16} />
                  <span>さらに景品を追加する</span>
                </button>
              </div>
            </div>

            {/* STEP 3: テストプレイ ＆ 保存ボタン */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-amber-100/60 rounded-3xl border-2 border-amber-300">
              <button
                type="button"
                onClick={handleTestPlay}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-black text-sm shadow-md transition-all active:scale-95"
              >
                <Eye size={18} className="text-amber-500" />
                <span>お試しテストプレイ（試し回し）</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 text-white font-black text-base shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles size={20} />
                <span>
                  {isSaving ? '保存中...' : editingGachaId ? '変更を保存する' : 'ガチャを公開する！'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* タブ2: マイガチャ管理（編集・削除） */}
        {activeTab === 'my_gachas' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border-4 border-emerald-300 shadow-md">
              <h2 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
                <Edit3 className="text-emerald-600" size={20} />
                <span>マイガチャ管理（編集・削除）</span>
              </h2>
              <p className="text-xs text-slate-500">
                作成したガチャの内容を編集したり、不要になったガチャを削除できます。
              </p>
            </div>

            {myGachas.length > 0 ? (
              <div className="space-y-3">
                {myGachas.map((gacha) => (
                  <div
                    key={gacha.id}
                    className="p-5 rounded-3xl border-2 border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      {gacha.cover_image ? (
                        <img
                          src={gacha.cover_image}
                          alt={gacha.title}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-black text-sm border border-emerald-200 flex-shrink-0">
                          ６-３
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
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

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditGacha(gacha)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Edit3 size={13} />
                        <span>編集する</span>
                      </button>

                      <button
                        onClick={() => handleDeleteGacha(gacha.id)}
                        className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-black text-xs transition-colors"
                        title="ガチャを削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-300">
                <p className="text-xs font-bold text-slate-500">
                  作成したガチャがまだありません。
                </p>
              </div>
            )}
          </div>
        )}

        {/* タブ3: 今日の運勢を作る */}
        {activeTab === 'fortune' && (
          <form onSubmit={handleSaveFortune} className="space-y-6">
            <div className="chalkboard-bg p-6 sm:p-8 text-white">
              <h2 className="text-xl font-black chalk-text-yellow mb-2 flex items-center gap-2">
                <Sun className="text-yellow-400" />
                <span>６年３組 今日の運勢を追加</span>
              </h2>
              <p className="text-xs text-emerald-100/90 mb-6">
                毎日のログイン時や「今日の運勢ガチャ」で引けるおみくじを作成・追加できます！
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-yellow-300 mb-2">
                    運勢ランク
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FORTUNE_RANKS.map((rank) => (
                      <button
                        key={rank}
                        type="button"
                        onClick={() => setFortuneRank(rank)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                          fortuneRank === rank
                            ? 'bg-yellow-400 text-slate-900 shadow-md scale-105'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        }`}
                      >
                        {rank}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-yellow-300 mb-1">
                    運勢メッセージ <span className="text-rose-300">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="例: 給食のおかわりじゃんけんで一発勝利する運勢！余った冷凍みかんもゲットできるかも。"
                    value={fortuneMessage}
                    onChange={(e) => setFortuneMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white placeholder-emerald-200/50 text-sm focus:outline-none focus:border-yellow-400 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-yellow-300 mb-1">
                      ラッキーアイテム（幸運具）
                    </label>
                    <input
                      type="text"
                      placeholder="例: 三角定規、赤白帽子、自由帳"
                      value={luckyItem}
                      onChange={(e) => setLuckyItem(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-sm focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-yellow-300 mb-1">
                      出現確率（重み）
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={fortuneWeight}
                      onChange={(e) => setFortuneWeight(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-sm focus:outline-none focus:border-yellow-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-yellow-300 mb-1">
                    作成者名
                  </label>
                  <input
                    type="text"
                    placeholder="例: ６年３組 占い係"
                    value={fortuneAuthor}
                    onChange={(e) => setFortuneAuthor(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-sm focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 text-slate-950 font-black text-base shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Sun size={20} />
                    <span>この運勢を今日のガチャに追加する！</span>
                  </button>
                </div>

                {fortuneSavedMsg && (
                  <div className="p-3 bg-emerald-800/80 rounded-xl border border-emerald-400 text-center text-xs font-bold text-white animate-fade-in flex items-center justify-center gap-1.5">
                    <Check size={16} className="text-yellow-300" />
                    <span>運勢を追加しました！「今日の運勢ガチャ」から出現するようになります。</span>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}
      </main>

      <ResultModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        items={testResult}
        isMulti={false}
        onSpinAgain={handleTestPlay}
      />
    </div>
  );
}
