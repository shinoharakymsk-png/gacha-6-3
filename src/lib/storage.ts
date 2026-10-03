import {
  Gacha,
  GachaItem,
  DailyFortune,
  FortuneHistoryRecord,
  AttendanceWallet,
  ItemReaction,
  UserCollectionItem,
  TradeListing,
} from '@/types';
import { INITIAL_GACHAS, INITIAL_FORTUNES } from './initialData';
import { getSupabaseClient } from './supabase';

const KEYS = {
  GACHAS: 'gacha_list_v4',
  FORTUNES: 'fortune_list_v4',
  TODAY_FORTUNE: 'user_today_fortune_v4',
  FORTUNE_HISTORY: 'fortune_history_v4',
  WALLET: 'attendance_wallet_v4',
  REACTIONS: 'gacha_item_reactions_v4',
  COLLECTIONS: 'user_gacha_collections_v4',
  CATEGORIES: 'custom_categories_v4',
  TRADES: 'trade_listings_v4',
};

const DEFAULT_CATEGORIES = ['学校生活', '給食', '放課後', '文房具', 'キャラクター', 'おもしろネタ'];

// ---------------- ガチャ管理 ----------------
export async function getGachas(): Promise<Gacha[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: gachasData, error } = await supabase
        .from('gachas')
        .select('*, items:gacha_items(*)')
        .order('created_at', { ascending: false });

      if (!error && gachasData) {
        return gachasData as Gacha[];
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage', e);
    }
  }

  if (typeof window === 'undefined') return INITIAL_GACHAS;
  const stored = localStorage.getItem(KEYS.GACHAS);
  if (!stored) {
    localStorage.setItem(KEYS.GACHAS, JSON.stringify(INITIAL_GACHAS));
    return INITIAL_GACHAS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_GACHAS;
  }
}

export async function getGachaById(id: string): Promise<Gacha | null> {
  const all = await getGachas();
  return all.find((g) => g.id === id) || null;
}

export async function saveGacha(gacha: Gacha): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error: gachaErr } = await supabase.from('gachas').upsert({
        id: gacha.id,
        title: gacha.title,
        description: gacha.description,
        category: gacha.category,
        cover_image: gacha.cover_image,
        author_name: gacha.author_name,
        play_count: gacha.play_count || 0,
        created_at: gacha.created_at,
      });

      if (!gachaErr && gacha.items && gacha.items.length > 0) {
        const itemsToInsert = gacha.items.map((item) => ({
          id: item.id,
          gacha_id: gacha.id,
          name: item.name,
          description: item.description,
          rarity: item.rarity,
          weight: item.weight,
          image_url: item.image_url,
          is_secret: Boolean(item.is_secret),
        }));
        await supabase.from('gacha_items').upsert(itemsToInsert);
      }
    } catch (e) {
      console.warn('Supabase save failed, storing locally', e);
    }
  }

  if (typeof window !== 'undefined') {
    const all = await getGachas();
    const index = all.findIndex((g) => g.id === gacha.id);
    let updated: Gacha[];
    if (index >= 0) {
      updated = [...all];
      updated[index] = gacha;
    } else {
      updated = [gacha, ...all];
    }
    localStorage.setItem(KEYS.GACHAS, JSON.stringify(updated));
  }
  return true;
}

export async function deleteGacha(gachaId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('gachas').delete().eq('id', gachaId);
    } catch (e) {
      console.warn('Supabase delete failed', e);
    }
  }

  if (typeof window !== 'undefined') {
    const all = await getGachas();
    const filtered = all.filter((g) => g.id !== gachaId);
    localStorage.setItem(KEYS.GACHAS, JSON.stringify(filtered));
  }
  return true;
}

export async function incrementPlayCount(gachaId: string, count: number = 1): Promise<void> {
  if (typeof window === 'undefined') return;
  const all = await getGachas();
  const target = all.find((g) => g.id === gachaId);
  if (target) {
    target.play_count = (target.play_count || 0) + count;
    await saveGacha(target);
  }
}

// ---------------- カテゴリ管理 ----------------
export function getCategories(): string[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  const stored = localStorage.getItem(KEYS.CATEGORIES);
  if (!stored) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  try {
    const custom = JSON.parse(stored);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...custom]));
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function addCategory(category: string): string[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  const current = getCategories();
  if (!current.includes(category.trim()) && category.trim()) {
    const updated = [...current, category.trim()];
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(updated));
    return updated;
  }
  return current;
}

// ---------------- 出席シール（毎日の登校スタンプ記録） ----------------
export function getWallet(): AttendanceWallet {
  const defaultWallet: AttendanceWallet = {
    seals: [],
    lastDailyClaimDate: '',
  };

  if (typeof window === 'undefined') return defaultWallet;
  const stored = localStorage.getItem(KEYS.WALLET);
  if (!stored) {
    localStorage.setItem(KEYS.WALLET, JSON.stringify(defaultWallet));
    return defaultWallet;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return defaultWallet;
  }
}

export function saveWallet(wallet: AttendanceWallet): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.WALLET, JSON.stringify(wallet));
}

export function claimDailyBonus(): { claimed: boolean; wallet: AttendanceWallet } {
  const wallet = getWallet();
  const todayStr = new Date().toISOString().split('T')[0];

  if (wallet.lastDailyClaimDate !== todayStr) {
    wallet.lastDailyClaimDate = todayStr;
    if (!wallet.seals.includes(todayStr)) {
      wallet.seals.push(todayStr);
    }
    saveWallet(wallet);
    return { claimed: true, wallet };
  }

  return { claimed: false, wallet };
}

// ---------------- 今日の運勢 ＆ 連絡帳履歴 ----------------
export async function getFortunes(): Promise<DailyFortune[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_fortunes')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as DailyFortune[];
      }
    } catch (e) {
      console.warn('Supabase fetch fortunes failed', e);
    }
  }

  if (typeof window === 'undefined') return INITIAL_FORTUNES;
  const stored = localStorage.getItem(KEYS.FORTUNES);
  if (!stored) {
    localStorage.setItem(KEYS.FORTUNES, JSON.stringify(INITIAL_FORTUNES));
    return INITIAL_FORTUNES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_FORTUNES;
  }
}

export async function saveFortune(fortune: DailyFortune): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('daily_fortunes').upsert({
        id: fortune.id,
        fortune_rank: fortune.fortune_rank,
        message: fortune.message,
        lucky_item: fortune.lucky_item,
        weight: fortune.weight,
        author_name: fortune.author_name,
        created_at: fortune.created_at,
      });
    } catch (e) {
      console.warn('Supabase save fortune failed', e);
    }
  }

  if (typeof window !== 'undefined') {
    const all = await getFortunes();
    const updated = [fortune, ...all.filter((f) => f.id !== fortune.id)];
    localStorage.setItem(KEYS.FORTUNES, JSON.stringify(updated));
  }
  return true;
}

export function getTodayUserFortune(): FortuneHistoryRecord | null {
  if (typeof window === 'undefined') return null;
  const todayStr = new Date().toISOString().split('T')[0];
  const stored = localStorage.getItem(KEYS.TODAY_FORTUNE);
  if (!stored) return null;
  try {
    const record: FortuneHistoryRecord = JSON.parse(stored);
    if (record.date === todayStr) {
      return record;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveTodayUserFortune(fortune: DailyFortune): void {
  if (typeof window === 'undefined') return;
  const todayStr = new Date().toISOString().split('T')[0];
  const record: FortuneHistoryRecord = {
    id: `history-${Date.now()}`,
    date: todayStr,
    fortune,
  };
  localStorage.setItem(KEYS.TODAY_FORTUNE, JSON.stringify(record));
  addFortuneHistory(record);
}

export function getFortuneHistory(): FortuneHistoryRecord[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(KEYS.FORTUNE_HISTORY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addFortuneHistory(record: FortuneHistoryRecord): void {
  if (typeof window === 'undefined') return;
  const history = getFortuneHistory();
  if (!history.some((h) => h.date === record.date)) {
    const updated = [record, ...history];
    localStorage.setItem(KEYS.FORTUNE_HISTORY, JSON.stringify(updated));
  }
}

// ---------------- 絵文字リアクション ----------------
export function getReactions(): ItemReaction {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(KEYS.REACTIONS);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export function addReaction(itemId: string, emoji: string): ItemReaction {
  const current = getReactions();
  if (!current[itemId]) {
    current[itemId] = {};
  }
  current[itemId][emoji] = (current[itemId][emoji] || 0) + 1;
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.REACTIONS, JSON.stringify(current));
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    Promise.resolve(
      supabase.from('item_reactions').insert({
        item_id: itemId,
        emoji: emoji,
        user_identifier: 'local_user',
      })
    ).catch(() => {});
  }

  return current;
}

// ---------------- コレクション（図鑑） ----------------
export function getUserCollections(): Record<string, UserCollectionItem> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(KEYS.COLLECTIONS);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export function recordObtainedItem(item: GachaItem): Record<string, UserCollectionItem> {
  const current = getUserCollections();
  const now = new Date().toISOString();
  if (current[item.id]) {
    current[item.id].count += 1;
    current[item.id].lastObtainedAt = now;
  } else {
    current[item.id] = {
      itemId: item.id,
      gachaId: item.gacha_id,
      count: 1,
      firstObtainedAt: now,
      lastObtainedAt: now,
    };
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(current));
  }
  return current;
}

export function consumeCollectionItem(itemId: string): boolean {
  const current = getUserCollections();
  if (!current[itemId] || current[itemId].count <= 0) return false;
  current[itemId].count -= 1;
  if (current[itemId].count <= 0) {
    delete current[itemId];
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(current));
  }
  return true;
}

// ---------------- トレード機能 ----------------
export function getTrades(): TradeListing[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(KEYS.TRADES);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function createTrade(listing: TradeListing): TradeListing[] {
  if (typeof window === 'undefined') return [];
  const current = getTrades();
  const updated = [listing, ...current];
  localStorage.setItem(KEYS.TRADES, JSON.stringify(updated));
  return updated;
}

export function completeTrade(tradeId: string, receivedItem: GachaItem): boolean {
  if (typeof window === 'undefined') return false;
  const current = getTrades();
  const target = current.find((t) => t.id === tradeId);
  if (!target || target.status === 'COMPLETED') return false;

  recordObtainedItem(target.offeredItem);
  target.status = 'COMPLETED';
  localStorage.setItem(KEYS.TRADES, JSON.stringify(current));
  return true;
}
