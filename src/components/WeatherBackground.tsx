'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { WeatherType, TimeOfDay, LocationOption } from '@/types';
import { Globe, Sliders, Check, Sun, Moon, Cloud, CloudRain, Snowflake, Flower2, Leaf, Sparkles, X, RotateCcw } from 'lucide-react';

// 日本の47都道府県 ＋ 世界の主要都市
export const LOCATIONS: LocationOption[] = [
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
  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(LOCATIONS[7]); // 東京都
  const [currentWeather, setCurrentWeather] = useState<WeatherType>('sunny');
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState<TimeOfDay>('day');
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [isOpenControl, setIsOpenControl] = useState(false);

  // 初回マウント時: ストレージから設定復元
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocId = localStorage.getItem('user_weather_location');
      if (savedLocId) {
        const found = LOCATIONS.find((l) => l.id === savedLocId);
        if (found) setSelectedLocation(found);
      }
    }
  }, []);

  // 地域やタイマーに応じたリアルタイム天候・時間帯計算
  useEffect(() => {
    if (!isManualOverride) {
      updateTimeAndWeather(selectedLocation);
    }
    const timer = setInterval(() => {
      if (!isManualOverride) {
        updateTimeAndWeather(selectedLocation);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [selectedLocation, isManualOverride]);

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
    setIsManualOverride(false);
    updateTimeAndWeather(loc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_weather_location', loc.id);
    }
  };

  // 星々のシードデータ（再レンダリングでも位置が変わらないようメモ化）
  const stars = useMemo(() => {
    return Array.from({ length: 90 }).map((_, i) => ({
      id: i,
      top: `${(i * 13.7) % 85}%`,
      left: `${(i * 23.3) % 98}%`,
      size: `${1 + (i % 3) * 0.9}px`,
      opacity: 0.35 + (i % 5) * 0.15,
      delay: `${(i % 12) * 0.4}s`,
      duration: `${2 + (i % 4) * 0.8}s`,
    }));
  }, []);

  // 光の微粒子（晴れ）
  const sunMotes = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      top: `${15 + ((i * 19) % 70)}%`,
      left: `${(i * 17) % 95}%`,
      size: `${3 + (i % 4) * 2}px`,
      duration: `${4 + (i % 5)}s`,
      delay: `${(i % 7) * 0.5}s`,
    }));
  }, []);

  // SSS品質：大気散乱シミュレーションによる空のグラデーション
  const getSkyGradient = () => {
    switch (currentTimeOfDay) {
      case 'morning':
        // 朝焼け：藍色から暁の茜色・琥珀色・光輝
        return 'linear-gradient(180deg, #18153d 0%, #2f275e 25%, #6a3568 45%, #b4434b 65%, #e86d3b 80%, #fed166 100%)';
      case 'day':
        // 昼：吸い込まれるコバルトブルーから澄み渡る青空、地平線の霞
        return 'linear-gradient(180deg, #0284c7 0%, #0ea5e9 30%, #38bdf8 65%, #bae6fd 100%)';
      case 'evening':
        // 夕焼け：紫紺から紅蓮、燃えるような茜色・夕映え
        return 'linear-gradient(180deg, #270e4f 0%, #4a154b 22%, #831843 45%, #c2410c 70%, #f97316 85%, #fde047 100%)';
      case 'night':
      default:
        // 夜：深宇宙の漆黒から濃紺・吸い込まれるようなリアルな夜空
        return 'linear-gradient(180deg, #020617 0%, #060c23 35%, #0b1437 70%, #111d4a 100%)';
    }
  };

  return (
    <>
      {/* =========================================================
          1. SSS品質 リアル空・天体・天候レイヤー（最背面固定）
          ========================================================= */}
      <div
        className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden transition-all duration-1000"
        style={{ background: getSkyGradient() }}
      >
        {/* ----------------- 天の川（夜空の星雲） ----------------- */}
        {currentTimeOfDay === 'night' && (
          <div
            className="absolute inset-0 opacity-25 transform -rotate-12 scale-125"
            style={{
              background:
                'radial-gradient(ellipse at 50% 40%, rgba(199, 210, 254, 0.3) 0%, rgba(147, 197, 253, 0.15) 30%, transparent 70%)',
              filter: 'blur(35px)',
            }}
          />
        )}

        {/* ----------------- 無数の星々（夜・朝方） ----------------- */}
        {(currentTimeOfDay === 'night' || currentTimeOfDay === 'morning') && (
          <div className="absolute inset-0">
            {stars.map((star) => (
              <div
                key={star.id}
                className="absolute rounded-full bg-white shadow-sm"
                style={{
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  opacity: star.opacity,
                  animation: `pulse ${star.duration} ease-in-out ${star.delay} infinite`,
                  boxShadow: `0 0 6px rgba(255, 255, 255, ${star.opacity})`,
                }}
              />
            ))}

            {/* 流星（流れ星） */}
            {currentTimeOfDay === 'night' && (
              <>
                <div
                  className="shooting-star-line"
                  style={{ top: '14%', right: '15%', animationDelay: '1.5s', animationDuration: '7s' }}
                />
                <div
                  className="shooting-star-line"
                  style={{ top: '32%', right: '40%', animationDelay: '5s', animationDuration: '9s' }}
                />
              </>
            )}
          </div>
        )}

        {/* ----------------- 太陽（昼・朝・夕方） ----------------- */}
        {currentTimeOfDay !== 'night' && (
          <div
            className={`absolute transition-all duration-1000 ${
              currentTimeOfDay === 'day'
                ? 'top-8 right-[18%] sm:right-[22%]'
                : currentTimeOfDay === 'morning'
                ? 'bottom-32 left-[12%] sm:left-[18%]'
                : 'bottom-24 right-[12%] sm:right-[16%]'
            }`}
          >
            {/* 太陽の光冠・ゴッドレイ（光線） */}
            <div
              className="absolute -inset-24 rounded-full animate-god-rays opacity-30"
              style={{
                background:
                  currentTimeOfDay === 'evening'
                    ? 'conic-gradient(from 0deg, transparent 0deg, rgba(251, 146, 60, 0.4) 30deg, transparent 60deg, rgba(254, 215, 170, 0.4) 120deg, transparent 180deg, rgba(251, 146, 60, 0.4) 240deg, transparent 300deg)'
                    : 'conic-gradient(from 0deg, transparent 0deg, rgba(255, 255, 255, 0.4) 30deg, transparent 60deg, rgba(254, 240, 138, 0.4) 120deg, transparent 180deg, rgba(255, 255, 255, 0.4) 240deg, transparent 300deg)',
                filter: 'blur(10px)',
              }}
            />

            {/* 太陽の外層オーラ */}
            <div
              className="absolute -inset-16 rounded-full animate-sun-corona"
              style={{
                background:
                  currentTimeOfDay === 'evening'
                    ? 'radial-gradient(circle, rgba(249, 115, 22, 0.7) 0%, rgba(234, 88, 12, 0.3) 50%, transparent 80%)'
                    : 'radial-gradient(circle, rgba(254, 240, 138, 0.8) 0%, rgba(253, 224, 71, 0.35) 50%, transparent 80%)',
                filter: 'blur(16px)',
              }}
            />

            {/* 太陽本体 */}
            <div
              className={`relative rounded-full shadow-2xl ${
                currentTimeOfDay === 'evening'
                  ? 'w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-tr from-red-500 via-orange-400 to-amber-300'
                  : 'w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-amber-100 via-yellow-200 to-white'
              }`}
              style={{
                boxShadow:
                  currentTimeOfDay === 'evening'
                    ? '0 0 50px rgba(249, 115, 22, 0.9), 0 0 100px rgba(239, 68, 68, 0.6)'
                    : '0 0 60px rgba(254, 240, 138, 1), 0 0 120px rgba(253, 224, 71, 0.8)',
              }}
            />
          </div>
        )}

        {/* ----------------- 月（夜・黄昏） ----------------- */}
        {currentTimeOfDay === 'night' && (
          <div className="absolute top-12 right-[15%] sm:right-[20%] transition-all duration-1000">
            {/* 月の青白い光芒（月暈） */}
            <div
              className="absolute -inset-20 rounded-full animate-moon-halo"
              style={{
                background: 'radial-gradient(circle, rgba(186, 230, 253, 0.4) 0%, rgba(147, 197, 253, 0.15) 50%, transparent 75%)',
                filter: 'blur(20px)',
              }}
            />

            {/* 月本体（クレーター陰影を施したリアルな月球） */}
            <div
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-slate-200 via-slate-100 to-amber-50 shadow-2xl overflow-hidden"
              style={{
                boxShadow: '0 0 35px rgba(224, 242, 254, 0.9), 0 0 70px rgba(186, 230, 253, 0.5)',
              }}
            >
              {/* 月のクレーター・海の模様 */}
              <div className="absolute top-3 left-4 w-5 h-5 rounded-full bg-slate-300/40 blur-[1px]" />
              <div className="absolute top-8 left-9 w-7 h-7 rounded-full bg-slate-300/35 blur-[1px]" />
              <div className="absolute bottom-4 left-6 w-8 h-8 rounded-full bg-slate-300/30 blur-[1.5px]" />
              <div className="absolute bottom-7 right-3 w-4 h-4 rounded-full bg-slate-300/45 blur-[1px]" />
            </div>
          </div>
        )}

        {/* ----------------- 多層リアル雲レイヤー ----------------- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* 奥の雲レイヤー（ゆっくり） */}
          <div className="absolute -top-10 -left-[10%] w-[120%] h-64 animate-cloud-slow opacity-60">
            <svg viewBox="0 0 1000 300" className="w-full h-full preserve-3d" fill="none">
              <path
                d="M 50,150 Q 80,100 150,110 Q 200,60 280,80 Q 350,50 420,90 Q 480,60 550,80 Q 620,40 700,70 Q 770,50 830,90 Q 900,80 950,130 Q 980,170 950,210 Q 900,240 820,230 Q 750,260 670,240 Q 580,270 500,240 Q 420,260 350,230 Q 260,250 180,220 Q 100,240 50,200 Z"
                fill={
                  currentTimeOfDay === 'evening'
                    ? 'url(#eveningCloudGradFar)'
                    : currentTimeOfDay === 'morning'
                    ? 'url(#morningCloudGradFar)'
                    : currentTimeOfDay === 'night'
                    ? 'url(#nightCloudGradFar)'
                    : 'url(#dayCloudGradFar)'
                }
              />
              <defs>
                <linearGradient id="dayCloudGradFar" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="eveningCloudGradFar" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbcfe8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#c2410c" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="morningCloudGradFar" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#f472b6" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="nightCloudGradFar" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* 手前の雲レイヤー（立体感） */}
          <div className="absolute top-16 -left-[5%] w-[115%] h-72 animate-cloud-fast opacity-75">
            <svg viewBox="0 0 1000 300" className="w-full h-full" fill="none">
              <path
                d="M 80,180 Q 120,120 200,130 Q 260,80 340,100 Q 420,60 500,100 Q 580,70 650,90 Q 730,50 820,85 Q 890,70 940,120 Q 980,170 940,220 Q 880,260 780,240 Q 700,270 600,250 Q 500,280 400,250 Q 300,270 200,240 Q 120,250 80,210 Z"
                fill={
                  currentTimeOfDay === 'evening'
                    ? 'url(#eveningCloudGradNear)'
                    : currentTimeOfDay === 'morning'
                    ? 'url(#morningCloudGradNear)'
                    : currentTimeOfDay === 'night'
                    ? 'url(#nightCloudGradNear)'
                    : 'url(#dayCloudGradNear)'
                }
              />
              <defs>
                <linearGradient id="dayCloudGradNear" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="eveningCloudGradNear" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#fb7185" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#7c2d12" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="morningCloudGradNear" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#fed7aa" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="nightCloudGradNear" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#334155" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* ----------------- リアル天候エフェクト（絵文字完全排除） ----------------- */}

        {/* 雨 ＆ 稲妻 */}
        {currentWeather === 'rain' && (
          <div className="absolute inset-0">
            {/* 稲妻閃光フラッシュ */}
            <div className="absolute inset-0 bg-white animate-lightning pointer-events-none" />

            {/* 雨滴（雨筋） */}
            {Array.from({ length: 55 }).map((_, i) => (
              <div
                key={i}
                className="real-rain-drop"
                style={{
                  left: `${(i * 1.85) % 100}%`,
                  animationDuration: `${0.45 + (i % 6) * 0.08}s`,
                  animationDelay: `${(i % 12) * 0.05}s`,
                  opacity: 0.5 + (i % 4) * 0.15,
                }}
              />
            ))}
          </div>
        )}

        {/* リアル雪（粉雪・結晶粒子） */}
        {currentWeather === 'snow' && (
          <div className="absolute inset-0">
            {Array.from({ length: 45 }).map((_, i) => (
              <div
                key={i}
                className="real-snow-flake"
                style={{
                  left: `${(i * 2.25) % 100}%`,
                  width: `${3 + (i % 5) * 2.5}px`,
                  height: `${3 + (i % 5) * 2.5}px`,
                  animationDuration: `${3.5 + (i % 6) * 1.2}s`,
                  animationDelay: `${(i % 10) * 0.4}s`,
                  opacity: 0.4 + (i % 5) * 0.15,
                }}
              />
            ))}
          </div>
        )}

        {/* リアル桜吹雪（3Dタンブリング花びら） */}
        {currentWeather === 'sakura' && (
          <div className="absolute inset-0">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="real-sakura-petal"
                style={{
                  left: `${(i * 3.3) % 100}%`,
                  transform: `scale(${0.6 + (i % 4) * 0.25})`,
                  animationDuration: `${4.5 + (i % 5) * 1.2}s`,
                  animationDelay: `${(i % 8) * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* リアル紅葉（カエデ・イチョウ風） */}
        {currentWeather === 'autumn' && (
          <div className="absolute inset-0">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="real-autumn-leaf"
                style={{
                  left: `${(i * 4.1) % 100}%`,
                  transform: `scale(${0.7 + (i % 4) * 0.25})`,
                  animationDuration: `${5.2 + (i % 4) * 1.5}s`,
                  animationDelay: `${(i % 7) * 0.6}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* 晴れ・太陽光の微粒子（サンモート） */}
        {currentWeather === 'sunny' && currentTimeOfDay !== 'night' && (
          <div className="absolute inset-0">
            {sunMotes.map((mote) => (
              <div
                key={mote.id}
                className="real-sun-mote"
                style={{
                  top: mote.top,
                  left: mote.left,
                  width: mote.size,
                  height: mote.size,
                  animationDuration: mote.duration,
                  animationDelay: mote.delay,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* =========================================================
          2. コントロールUI（最前面 z-50、直感的な設定ポップアップ）
          ========================================================= */}
      <div className="fixed bottom-5 right-5 z-50 pointer-events-auto select-none">
        <div className="relative">
          {/* 地球儀ボタン */}
          <button
            type="button"
            onClick={() => setIsOpenControl(!isOpenControl)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-amber-400 text-amber-950 dark:text-amber-100 font-black text-xs shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-amber-300/50"
            title="リアル空＆天候コントロール"
          >
            <Globe size={18} className="text-amber-600 animate-spin" style={{ animationDuration: '25s' }} />
            <span className="font-bold">{selectedLocation.name.split(' ')[0]}</span>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              {currentTimeOfDay === 'morning' && <Sun size={10} className="text-orange-500" />}
              {currentTimeOfDay === 'day' && <Sun size={10} className="text-amber-500" />}
              {currentTimeOfDay === 'evening' && <Sun size={10} className="text-rose-500" />}
              {currentTimeOfDay === 'night' && <Moon size={10} className="text-indigo-400" />}
              <span>
                {currentTimeOfDay === 'morning'
                  ? '朝'
                  : currentTimeOfDay === 'day'
                  ? '昼'
                  : currentTimeOfDay === 'evening'
                  ? '夕方'
                  : '夜'}
              </span>
            </span>
            <Sliders size={14} className="text-slate-400" />
          </button>

          {/* コントロールポップアップ */}
          {isOpenControl && (
            <div className="absolute bottom-14 right-0 w-84 max-h-[85vh] overflow-y-auto bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl rounded-3xl p-5 border-4 border-amber-300 shadow-2xl space-y-4 animate-drop text-slate-800 dark:text-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={16} className="text-amber-500" />
                  <span className="text-xs font-black">SSS品質 リアル空・天候エンジン</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpenControl(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 手動切り替え（タイムワープ） */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">空の時間帯を選ぶ</span>
                  {isManualOverride && (
                    <button
                      onClick={() => {
                        setIsManualOverride(false);
                        updateTimeAndWeather(selectedLocation);
                      }}
                      className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 hover:underline"
                    >
                      <RotateCcw size={10} />
                      <span>現在時刻に戻す</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: 'morning', label: '朝焼け', icon: Sun, color: 'text-orange-500' },
                      { id: 'day', label: '青空', icon: Sun, color: 'text-amber-500' },
                      { id: 'evening', label: '夕焼け', icon: Sun, color: 'text-rose-500' },
                      { id: 'night', label: '星空 (夜)', icon: Moon, color: 'text-indigo-400' },
                    ] as const
                  ).map((t) => {
                    const Icon = t.icon;
                    const isSelected = currentTimeOfDay === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setCurrentTimeOfDay(t.id);
                          setIsManualOverride(true);
                        }}
                        className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-white font-black shadow-md scale-102'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100'
                        }`}
                      >
                        <Icon size={14} className={isSelected ? 'text-white' : t.color} />
                        <span className="text-[10px] font-bold">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 天候エフェクトセレクター */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500">天候エフェクトを選ぶ</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'sunny', label: '快晴・光', icon: Sun, color: 'text-amber-500' },
                      { id: 'cloudy', label: '雲海', icon: Cloud, color: 'text-slate-400' },
                      { id: 'rain', label: '雨 ＆ 雷', icon: CloudRain, color: 'text-sky-500' },
                      { id: 'snow', label: '粉雪', icon: Snowflake, color: 'text-cyan-400' },
                      { id: 'sakura', label: '桜吹雪', icon: Flower2, color: 'text-pink-500' },
                      { id: 'autumn', label: '紅葉', icon: Leaf, color: 'text-orange-600' },
                    ] as const
                  ).map((w) => {
                    const Icon = w.icon;
                    const isSelected = currentWeather === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setCurrentWeather(w.id);
                          setIsManualOverride(true);
                        }}
                        className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-white font-black shadow-md scale-102'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-100'
                        }`}
                      >
                        <Icon size={14} className={isSelected ? 'text-white' : w.color} />
                        <span className="text-[10px] font-bold">{w.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 都道府県・世界都市の選択 */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500">地域でリアルタイム連動</span>
                  <span className="text-[10px] text-slate-400">{LOCATIONS.length}都市</span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1 border rounded-xl p-1 bg-slate-50 dark:bg-slate-800/50">
                  {LOCATIONS.map((loc) => {
                    const isSelected = selectedLocation.id === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-white font-black'
                            : 'hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[10px] opacity-75">{loc.country === '日本' ? '🇯🇵' : '🌍'}</span>
                          <span className="truncate">{loc.name}</span>
                        </div>
                        {isSelected && <Check size={12} className="flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
