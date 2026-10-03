'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, PlusCircle, BookOpen, Sun, Settings, Database, Menu, X, Repeat, Home } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface NavbarProps {
  onOpenFortune?: () => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenFortune, onOpenSettings }) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [supabaseActive, setSupabaseActive] = useState(false);

  useEffect(() => {
    setSupabaseActive(isSupabaseConfigured());
  }, []);

  const navLinks = [
    { href: '/', label: 'ホーム', icon: Home },
    { href: '/play', label: '回す', icon: Sparkles },
    { href: '/create', label: '作る', icon: PlusCircle },
    { href: '/collection', label: '図鑑', icon: BookOpen },
    { href: '/trade', label: 'トレード', icon: Repeat },
  ];

  return (
    <header className="sticky top-0 z-40 bg-amber-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b-4 border-amber-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* ロゴ */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white text-xl shadow-md group-hover:rotate-6 transition-transform">
            🎒
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-amber-950 dark:text-amber-100 tracking-wider">６年３組ガチャ</span>
              <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full shadow-inner">
                教室
              </span>
            </div>
            <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">まわして・つくって・あつめよう！</p>
          </div>
        </Link>

        {/* PC向けメニュー */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-amber-950 dark:text-amber-100 hover:bg-amber-200/60'
                }`}
              >
                <Icon size={14} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* 今日の運勢ボタン */}
          {onOpenFortune && (
            <button
              onClick={onOpenFortune}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-all animate-bounce ml-1"
              title="今日の運勢を占う"
            >
              <Sun size={14} />
              <span>運勢</span>
            </button>
          )}

          {/* Supabase設定 */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-xl text-amber-800 hover:bg-amber-200/60 transition-colors flex items-center gap-1 text-[11px] font-semibold ml-1"
              title="Supabase・保存設定"
            >
              <Database size={14} className={supabaseActive ? 'text-emerald-600' : 'text-slate-400'} />
              <Settings size={13} />
            </button>
          )}
        </nav>

        {/* モバイル用ハンバーガーボタン */}
        <div className="flex lg:hidden items-center gap-2">
          {onOpenFortune && (
            <button
              onClick={onOpenFortune}
              className="p-1.5 px-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Sun size={14} />
              <span>運勢</span>
            </button>
          )}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl text-amber-900 hover:bg-amber-200/60"
            aria-label="メニュー"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* モバイルドロワーメニュー */}
      {isMenuOpen && (
        <div className="lg:hidden bg-amber-50 dark:bg-slate-900 border-b-2 border-amber-300 px-4 py-3 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${
                  isActive ? 'bg-amber-500 text-white' : 'text-amber-900 dark:text-amber-100 hover:bg-amber-200/50'
                }`}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          {onOpenSettings && (
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold text-amber-900 dark:text-amber-100 hover:bg-amber-200/50"
            >
              <div className="flex items-center gap-2">
                <Database size={15} className={supabaseActive ? 'text-emerald-600' : 'text-slate-400'} />
                <span>データベース設定 ({supabaseActive ? 'Supabase' : 'ローカル'})</span>
              </div>
              <Settings size={15} />
            </button>
          )}
        </div>
      )}
    </header>
  );
};
