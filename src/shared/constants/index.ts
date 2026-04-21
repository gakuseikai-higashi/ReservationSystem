import { AvailableTime } from '../types';

/**
 * 1週間先から1ヶ月先までの日付リスト（土日除外）を生成
 */
export const DATE_UNTIL_NEXT_MONTH: string[] = Array.from({ length: 24 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i + 7);
  return date;
}).filter((date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6; // 日曜(0)・土曜(6)を除外
}).map((date) => date.toISOString().split('T')[0]);

/**
 * 利用可能な時間テーブル（09:00〜20:00, 30分刻み）
 */
export const TIME_TABLE: AvailableTime[] = Array.from({ length: 22 }, (_, i) => {
  const startHour = 9 + Math.floor((i * 30) / 60);
  const startMinute = (i * 30) % 60;
  const endHour = 9 + Math.floor((i * 30 + 30) / 60);
  const endMinute = (i * 30 + 30) % 60;

  return {
    startTime: `${startHour < 10 ? '0' + startHour : startHour}:${startMinute === 0 ? '00' : '30'}`,
    endTime: `${endHour < 10 ? '0' + endHour : endHour}:${endMinute === 0 ? '00' : '30'}`,
    isAvailable: undefined,
  };
});

/**
 * アプリケーション設定
 */
export const APP_CONFIG = {
  // バックエンドURL
  BACKEND_URL: (import.meta as any).env.VITE_BACKEND_URL || 'http://127.0.0.1:8000',

  // API設定
  API: {
    TIMEOUT: 10000,
    RETRIES: 3,
    RETRY_DELAY: 1000,
  },

  // ページネーション設定
  PAGINATION: {
    ITEMS_PER_PAGE: 10,
  },

  // ローカルストレージキー
  STORAGE_KEYS: {
    AUTH_TOKEN: (import.meta as any).env.VITE_AUTH_TOKEN_KEY || 'admin_auth_token',
  },

  // Gmail 送信アカウント（空の場合はブラウザのデフォルトアカウントを使用）
  GMAIL_SENDER: (import.meta as any).env.VITE_GMAIL_SENDER || '',
} as const;
