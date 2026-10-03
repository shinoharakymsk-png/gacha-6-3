export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR';

export interface GachaItem {
  id: string;
  gacha_id: string;
  name: string;
  description: string;
  rarity: Rarity;
  weight: number; // 確率・出現比率
  image_url?: string; // アップロードしたオリジナル画像 (Base64またはURL)
  is_secret?: boolean;
}

export interface Gacha {
  id: string;
  title: string;
  description: string;
  category: string;
  cover_image?: string; // アップロードしたオリジナル画像 (Base64またはURL)
  author_name: string;
  play_count: number;
  created_at: string;
  is_user_created?: boolean;
  items: GachaItem[];
}

export interface DailyFortune {
  id: string;
  fortune_rank: '超大吉' | '大吉' | '中吉' | '小吉' | '吉' | '凶' | '大凶' | string;
  message: string;
  lucky_item: string;
  weight: number;
  author_name: string;
  created_at: string;
}

export interface FortuneHistoryRecord {
  id: string;
  date: string; // YYYY-MM-DD
  fortune: DailyFortune;
}

export type UserFortuneHistory = FortuneHistoryRecord;

export interface AttendanceWallet {
  seals: string[]; // 出席シールを獲得した日付一覧 (YYYY-MM-DD)
  lastDailyClaimDate: string; // 最後にログインボーナスを受け取った日付 (YYYY-MM-DD)
}

export interface ItemReaction {
  [itemId: string]: {
    [emoji: string]: number;
  };
}

export interface UserCollectionItem {
  itemId: string;
  gachaId: string;
  count: number;
  firstObtainedAt: string;
  lastObtainedAt: string;
}

// ---------------- トレード機能 ----------------
export interface TradeListing {
  id: string;
  offeredItem: GachaItem;
  wantedRarity?: Rarity | 'ANY';
  wantedItemName?: string;
  ownerName: string;
  createdAt: string;
  status: 'OPEN' | 'COMPLETED';
}

// ---------------- 動的背景（天気・地域） ----------------
export type WeatherType = 'sunny' | 'rain' | 'snow' | 'cloudy' | 'sakura' | 'autumn';
export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

export interface LocationOption {
  id: string;
  name: string;
  country: string;
  timezoneOffset: number;
  defaultWeather: WeatherType;
}
