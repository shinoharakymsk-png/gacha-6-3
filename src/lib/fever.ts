export interface FeverStatus {
  isAvailableTime: boolean; // 8:00〜21:00 内かどうか
  isFeverActive: boolean; // 現在フィーバー中かどうか
  multiplier: number; // レアリティ倍率 (通常1、フィーバー時は2)
  reason?: string;
}

// 門限チェック（8:00〜21:00のみ開催可能）
export function checkFeverStatus(): FeverStatus {
  if (typeof window === 'undefined') {
    return { isAvailableTime: true, isFeverActive: false, multiplier: 1 };
  }

  const now = new Date();
  const currentHour = now.getHours();

  // 21時〜8時は門限（開催不可）
  if (currentHour >= 21 || currentHour < 8) {
    return {
      isAvailableTime: false,
      isFeverActive: false,
      multiplier: 1,
      reason: '🌙 下校時刻です（21:00〜8:00は門限のためフィーバータイムはお休みです）',
    };
  }

  // 8:00〜21:00 の間：
  // ランダムまたは1時間ごとの特定分数（例: 毎時00分〜15分、またはランダムフラグ）で発動
  // ユーザーがテストできるように localStorage での強制発動フラグもサポート
  const manualFever = localStorage.getItem('manual_fever_active') === 'true';
  const minute = now.getMinutes();
  const isAutoFever = (minute >= 10 && minute <= 25) || (minute >= 40 && minute <= 55);

  const isFever = manualFever || isAutoFever;

  return {
    isAvailableTime: true,
    isFeverActive: isFever,
    multiplier: isFever ? 2 : 1,
    reason: isFever ? '🔥 フィーバータイム発動中！SSR・UR出現率が2倍！' : '現在通常モードです',
  };
}

export function toggleManualFever(): boolean {
  if (typeof window === 'undefined') return false;
  const current = localStorage.getItem('manual_fever_active') === 'true';
  localStorage.setItem('manual_fever_active', (!current).toString());
  return !current;
}
