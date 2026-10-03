import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '６年３組ガチャ | まわして・つくって・あつめよう！',
  description:
    '懐かしの小学校６年３組をテーマにしたガチャガチャプラットフォーム。ガチャを回したり、オリジナルガチャや今日の運勢を作成しよう！',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
