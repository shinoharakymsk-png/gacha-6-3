'use client';

import React, { useState, useEffect } from 'react';
import { X, Database, Check, ExternalLink, Key, RefreshCw } from 'lucide-react';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(localStorage.getItem('user_supabase_url') || '');
      setAnonKey(localStorage.getItem('user_supabase_anon_key') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      if (url.trim() && anonKey.trim()) {
        localStorage.setItem('user_supabase_url', url.trim());
        localStorage.setItem('user_supabase_anon_key', anonKey.trim());
      } else {
        localStorage.removeItem('user_supabase_url');
        localStorage.removeItem('user_supabase_anon_key');
      }
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        window.location.reload();
      }, 800);
    }
  };

  const handleResetToLocal = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_supabase_url');
      localStorage.removeItem('user_supabase_anon_key');
      setUrl('');
      setAnonKey('');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border-4 border-emerald-400">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
            <Database size={22} />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            データベース & Supabase 設定
          </h2>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
          現在はブラウザの高速ローカル保存モードで動作しています。Supabaseプロジェクトを接続すると、クラウド上で全ユーザーとガチャを共有できます。
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Project URL
            </label>
            <input
              type="text"
              placeholder="https://xxxxxxxx.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Key size={12} />
              <span>Anon Public API Key</span>
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 mb-6 text-xs text-emerald-900 dark:text-emerald-300 space-y-1.5">
          <div className="font-bold flex items-center gap-1">
            <span>💡 SupabaseとVercelの設定ヒント:</span>
          </div>
          <p>
            ・プロジェクト内の <code>supabase/schema.sql</code> をSupabaseのSQL Editorで実行するだけでテーブルが自動構築されます。
          </p>
          <p>
            ・Vercelデプロイ時は <code>NEXT_PUBLIC_SUPABASE_URL</code> と <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> をEnvironment Variablesに登録してください。
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleResetToLocal}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors"
          >
            <RefreshCw size={12} />
            <span>ローカルモードに戻す</span>
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center gap-1.5 transition-colors"
          >
            {isSaved ? (
              <>
                <Check size={16} />
                <span>保存しました！再読み込み中...</span>
              </>
            ) : (
              <span>設定を保存</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
