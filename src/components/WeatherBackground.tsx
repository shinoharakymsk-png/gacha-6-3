'use client';

import React, { useState, useEffect } from 'react';
import { WeatherType, TimeOfDay, LocationOption } from '@/types';
import { Globe, Sliders, Check } from 'lucide-react';

// 日本の47都道府県 ＋ 世界の主要都市
const LOCATIONS: LocationOption[] = [
  // 北海道・東北
  { id: 'hokkaido', name: '北海道 (札幌)', country: '日本', timezoneOffset: 9, defaultWeather: 'snow' },
  { id: 'aomori', name: '青森県', country: '日本', timezoneOffset: 9, defaultWeather: 'snow' },
  { id: 'iwate', name: '岩手県', country: '日本', timezoneOffset: 9, defaultWeather: 'cloudy' },
  { id: 'miyagi', name: '宮城県 (仙台)', country: '日本', timezoneOffset: 9, defaultWeather: 'autumn' },
  { id: 'akita', name: '秋田県', country: '日本', timezoneOffset: 9, defaultWeather: 'snow' },
  { id: 'yamagata', name: '山形県', country: '日本', timezoneOffset: 9, defaultWeather: 'snow' },
  { id: 'fukushima', name: '福島県', country: '日本', timezoneOffset: 9, defaultWeather: 'autumn' },

  // 関東
  { id: 'tokyo', name: '東京都 (東京)', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'kanagawa', name: '神奈川県 (横浜)', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'saitama', name: '埼玉県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'chiba', name: '千葉県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'ibaraki', name: '茨城県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'tochigi', name: '栃木県', country: '日本', timezoneOffset: 9, defaultWeather: 'autumn' },
  { id: 'gunma', name: '群馬県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },

  // 中部・北陸
  { id: 'niigata', name: '新潟県', country: '日本', timezoneOffset: 9, defaultWeather: 'snow' },
  { id: 'toyama', name: '富山県', country: '日本', timezoneOffset: 9, defaultWeather: 'snow' },
  { id: 'ishikawa', name: '石川県 (金沢)', country: '日本', timezoneOffset: 9, defaultWeather: 'rain' },
  { id: 'fukui', name: '福井県', country: '日本', timezoneOffset: 9, defaultWeather: 'snow' },
  { id: 'yamanashi', name: '山梨県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'nagano', name: '長野県', country: '日本', timezoneOffset: 9, defaultWeather: 'snow' },
  { id: 'gifu', name: '岐阜県', country: '日本', timezoneOffset: 9, defaultWeather: 'cloudy' },
  { id: 'shizuoka', name: '静岡県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'aichi', name: '愛知県 (名古屋)', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },

  // 近畿
  { id: 'kyoto', name: '京都府 (京都)', country: '日本', timezoneOffset: 9, defaultWeather: 'sakura' },
  { id: 'osaka', name: '大阪府 (大阪)', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'hyogo', name: '兵庫県 (神戸)', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'nara', name: '奈良県', country: '日本', timezoneOffset: 9, defaultWeather: 'autumn' },
  { id: 'mie', name: '三重県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'shiga', name: '滋賀県', country: '日本', timezoneOffset: 9, defaultWeather: 'cloudy' },
  { id: 'wakayama', name: '和歌山県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },

  // 中国・四国
  { id: 'tottori', name: '鳥取県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'shimane', name: '島根県', country: '日本', timezoneOffset: 9, defaultWeather: 'cloudy' },
  { id: 'okayama', name: '岡山県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'hiroshima', name: '広島県 (広島)', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'yamaguchi', name: '山口県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'tokushima', name: '徳島県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'kagawa', name: '香川県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'ehime', name: '愛媛県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'kochi', name: '高知県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },

  // 九州・沖縄
  { id: 'fukuoka', name: '福岡県 (福岡)', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'saga', name: '佐賀県', country: '日本', timezoneOffset: 9, defaultWeather: 'cloudy' },
  { id: 'nagasaki', name: '長崎県', country: '日本', timezoneOffset: 9, defaultWeather: 'rain' },
  { id: 'kumamoto', name: '熊本県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'oita', name: '大分県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'miyazaki', name: '宮崎県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'kagoshima', name: '鹿児島県', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },
  { id: 'okinawa', name: '沖縄県 (那覇)', country: '日本', timezoneOffset: 9, defaultWeather: 'sunny' },

  // 世界の都市
  { id: 'newyork', name: 'ニューヨーク (USA)', country: 'アメリカ', timezoneOffset: -4, defaultWeather: 'cloudy' },
  { id: 'london', name: 'ロンドン (UK)', country: 'イギリス', timezoneOffset: 1, defaultWeather: 'rain' },
  { id: 'paris', name: 'パリ (France)', country: 'フランス', timezoneOffset: 2, defaultWeather: 'autumn' },
  { id: 'taipei', name: '台北 (Taiwan)', country: '台湾', timezoneOffset: 8, defaultWeather: 'sunny' },
  { id: 'seoul', name: 'ソウル (Korea)', country: '韓国', timezoneOffset: 9, defaultWeather: 'snow' },
  { id: 'sydney', name: 'シドニー (Australia)', country: 'オーストラリア', timezoneOffset: 10, defaultWeather: 'sunny' },
  { id: 'hawaii', name: 'ハワイ (Honolulu)', country: 'アメリカ', timezoneOffset: -10, defaultWeather: 'sunny' },
];

export const WeatherBackground: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(LOCATIONS[7]); // デフォルト: 東京都
  const [currentWeather, setCurrentWeather] = useState<WeatherType>('sunny');
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState<TimeOfDay>('day');
  const [isOpenControl, setIsOpenControl] = useState(false);

  useEffect(() => {
    // ローカルストレージから前回の地域選択を復元
    if (typeof window !== 'undefined') {
      const savedLocId = localStorage.getItem('user_weather_location');
      if (savedLocId) {
        const found = LOCATIONS.find((l) => l.id === savedLocId);
        if (found) setSelectedLocation(found);
      }
    }
  }, []);

  useEffect(() => {
    updateTimeAndWeather(selectedLocation);
    const timer = setInterval(() => {
      updateTimeAndWeather(selectedLocation);
    }, 60000);
    return () => clearInterval(timer);
  }, [selectedLocation]);

  const updateTimeAndWeather = (loc: LocationOption) => {
    const now = new Date();
    const utcHours = now.getUTCHours() + loc.timezoneOffset;
    const localHours = (utcHours + 24) % 24;

    if (localHours >= 5 && localHours < 9) {
      setCurrentTimeOfDay('morning');
    } else if (localHours >= 9 && localHours < 16) {
      setCurrentTimeOfDay('day');
    } else if (localHours >= 16 && localHours < 19) {
      setCurrentTimeOfDay('evening');
    } else {
      setCurrentTimeOfDay('night');
    }

    const month = now.getMonth() + 1;
    if (month >= 3 && month <= 4) {
      setCurrentWeather('sakura');
    } else if (month >= 10 && month <= 11) {
      setCurrentWeather('autumn');
    } else if (month === 12 || month <= 2) {
      setCurrentWeather(loc.defaultWeather === 'snow' ? 'snow' : 'sunny');
    } else {
      setCurrentWeather(loc.defaultWeather);
    }
  };

  const handleSelectLocation = (loc: LocationOption) => {
    setSelectedLocation(loc);
    updateTimeAndWeather(loc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_weather_location', loc.id);
    }
  };

  const timeBackgrounds: Record<TimeOfDay, string> = {
    morning: 'from-amber-100/40 via-sky-100/50 to-orange-100/30',
    day: 'from-sky-50/60 via-amber-50/40 to-blue-50/40',
    evening: 'from-orange-200/50 via-rose-200/40 to-purple-300/30',
    night: 'from-slate-900/10 via-indigo-950/15 to-slate-900/20',
  };

  return (
    <>
      {/* 1. 背景レイヤー（最背面 z-[-1]、ポインターイベント無効） */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden transition-colors duration-1000">
        <div className={`absolute inset-0 bg-gradient-to-b ${timeBackgrounds[currentTimeOfDay]}`} />

        {/* 雨 */}
        {currentWeather === 'rain' && (
          <div className="absolute inset-0 opacity-40">
            <div className="rain-container">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="rain-drop"
                  style={{
                    left: `${(i * 2.5) % 100}%`,
                    animationDuration: `${0.6 + (i % 5) * 0.15}s`,
                    animationDelay: `${(i % 10) * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 雪 */}
        {currentWeather === 'snow' && (
          <div className="absolute inset-0 opacity-60">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="snow-flake"
                style={{
                  left: `${(i * 3.3) % 100}%`,
                  animationDuration: `${3 + (i % 5)}s`,
                  animationDelay: `${(i % 8) * 0.4}s`,
                  transform: `scale(${0.5 + (i % 4) * 0.25})`,
                }}
              >
                ❄
              </div>
            ))}
          </div>
        )}

        {/* 桜吹雪 */}
        {currentWeather === 'sakura' && (
          <div className="absolute inset-0 opacity-50">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="sakura-petal"
                style={{
                  left: `${(i * 4) % 100}%`,
                  animationDuration: `${4 + (i % 4)}s`,
                  animationDelay: `${(i % 6) * 0.5}s`,
                }}
              >
                🌸
              </div>
            ))}
          </div>
        )}

        {/* 紅葉 */}
        {currentWeather === 'autumn' && (
          <div className="absolute inset-0 opacity-50">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="sakura-petal"
                style={{
                  left: `${(i * 5) % 100}%`,
                  animationDuration: `${5 + (i % 4)}s`,
                  animationDelay: `${(i % 5) * 0.6}s`,
                }}
              >
                🍁
              </div>
            ))}
          </div>
        )}

        {/* 夜の星空 */}
        {currentTimeOfDay === 'night' && (
          <div className="absolute inset-0 opacity-30">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-yellow-200 animate-pulse text-xs"
                style={{
                  top: `${(i * 7) % 80}%`,
                  left: `${(i * 11) % 100}%`,
                  animationDuration: `${1.5 + (i % 3)}s`,
                }}
              >
                ✨
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. コントロールUI（最前面 z-50、ポインターイベント有効） */}
      <div className="fixed bottom-5 right-5 z-50 pointer-events-auto select-none">
        <div className="relative">
          {/* 地球儀ボタン */}
          <button
            type="button"
            onClick={() => setIsOpenControl(!isOpenControl)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-amber-400 text-amber-950 dark:text-amber-100 font-black text-xs shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-amber-300/50"
            title="リアルタイム背景・地域設定（全都道府県・世界都市）"
          >
            <Globe size={18} className="text-amber-600 animate-spin" style={{ animationDuration: '20s' }} />
            <span className="font-bold">{selectedLocation.name.split(' ')[0]}</span>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">
              {currentTimeOfDay === 'morning'
                ? '🌅 朝'
                : currentTimeOfDay === 'day'
                ? '☀️ 昼'
                : currentTimeOfDay === 'evening'
                ? '🌇 夕方'
                : '🌙 夜'}
            </span>
            <Sliders size={14} className="text-slate-400" />
          </button>

          {/* コントロールポップアップ */}
          {isOpenControl && (
            <div className="absolute bottom-14 right-0 w-80 max-h-[80vh] overflow-y-auto bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-3xl p-5 border-4 border-amber-300 shadow-2xl space-y-4 animate-drop text-slate-800 dark:text-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Globe size={16} className="text-amber-500" />
                  <span className="text-xs font-black">リアルタイム背景・地域設定</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpenControl(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* 地域選択（全都道府県 ＆ 世界主要都市） */}
              <div>
                <label className="block text-[11px] font-black text-slate-600 dark:text-slate-300 mb-1.5">
                  地域を選択 (日本47都道府県 ＆ 世界都市)
                </label>
                <select
                  value={selectedLocation.id}
                  onChange={(e) => {
                    const found = LOCATIONS.find((l) => l.id === e.target.value);
                    if (found) handleSelectLocation(found);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-amber-200 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <optgroup label="🇯🇵 日本の地域（47都道府県）">
                    {LOCATIONS.filter((l) => l.country === '日本').map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌍 世界の都市">
                    {LOCATIONS.filter((l) => l.country !== '日本').map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* 天気手動切替 */}
              <div>
                <label className="block text-[11px] font-black text-slate-600 dark:text-slate-300 mb-1.5">
                  天候エフェクト
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                  {[
                    { type: 'sunny', label: '晴れ ☀️' },
                    { type: 'rain', label: '雨 🌧️' },
                    { type: 'snow', label: '雪 ❄️' },
                    { type: 'sakura', label: '桜吹雪 🌸' },
                    { type: 'autumn', label: '紅葉 🍁' },
                    { type: 'cloudy', label: '曇り ☁️' },
                  ].map((w) => (
                    <button
                      key={w.type}
                      type="button"
                      onClick={() => setCurrentWeather(w.type as WeatherType)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        currentWeather === w.type
                          ? 'bg-amber-500 text-white font-black border-amber-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 時間帯手動切替 */}
              <div>
                <label className="block text-[11px] font-black text-slate-600 dark:text-slate-300 mb-1.5">
                  時間帯
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                  {(['morning', 'day', 'evening', 'night'] as TimeOfDay[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCurrentTimeOfDay(t)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        currentTimeOfDay === t
                          ? 'bg-amber-500 text-white font-black border-amber-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {t === 'morning' ? '朝 🌅' : t === 'day' ? '昼 ☀️' : t === 'evening' ? '夕 🌇' : '夜 🌙'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 text-center font-bold">
                ※選択した地域の時間帯・天候がリアルタイムに教室の背景に反映されます。
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
