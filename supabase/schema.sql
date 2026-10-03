-- ６年３組ガチャ データベーススキーマ（Supabase用）

-- 1. ガチャテーブル
CREATE TABLE IF NOT EXISTS public.gachas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT '学校生活',
  cover_image TEXT,
  author_name TEXT DEFAULT '６年３組 仲間たち',
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ガチャ景品アイテムテーブル
CREATE TABLE IF NOT EXISTS public.gacha_items (
  id TEXT PRIMARY KEY,
  gacha_id TEXT NOT NULL REFERENCES public.gachas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('N', 'R', 'SR', 'SSR', 'UR')),
  weight INTEGER NOT NULL DEFAULT 10,
  image_url TEXT,
  icon TEXT,
  is_secret BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 今日の運勢テーブル
CREATE TABLE IF NOT EXISTS public.daily_fortunes (
  id TEXT PRIMARY KEY,
  fortune_rank TEXT NOT NULL,
  message TEXT NOT NULL,
  lucky_item TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 10,
  author_name TEXT DEFAULT '６年３組 占い係',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 絵文字リアクションテーブル
CREATE TABLE IF NOT EXISTS public.item_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES public.gacha_items(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  user_identifier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) の設定 (パブリック読み取り・作成を許可)
ALTER TABLE public.gachas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gacha_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_fortunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for gachas" ON public.gachas FOR SELECT USING (true);
CREATE POLICY "Allow public insert for gachas" ON public.gachas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for gachas" ON public.gachas FOR UPDATE USING (true);

CREATE POLICY "Allow public read for gacha_items" ON public.gacha_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert for gacha_items" ON public.gacha_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for gacha_items" ON public.gacha_items FOR UPDATE USING (true);

CREATE POLICY "Allow public read for daily_fortunes" ON public.daily_fortunes FOR SELECT USING (true);
CREATE POLICY "Allow public insert for daily_fortunes" ON public.daily_fortunes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read for item_reactions" ON public.item_reactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert for item_reactions" ON public.item_reactions FOR INSERT WITH CHECK (true);
