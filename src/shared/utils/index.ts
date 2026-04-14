/**
 * 部屋コードを日本語ラベルに変換
 */
export const formatRoomLabel = (room: string): string => {
  const map: Record<string, string> = { LARGE: '大', SMALL: '小' };
  return map[room] ?? room;
};

/**
 * 予約ステータスに応じたバッジ情報を返す
 * 内部状態は英語キー (PENDING 等) で管理し、表示ラベルのみ日本語にする
 */
export const getStatusBadgeInfo = (
  status: string,
): { color: string; label: string; variant: 'solid' | 'outline' | 'subtle' } => {
  switch (status) {
    case 'PENDING':
      return { color: 'orange', label: '承認待ち', variant: 'solid' };
    case 'APPROVED':
      return { color: 'blue', label: '承認済み', variant: 'solid' };
    case 'USING':
      return { color: 'green', label: '使用中', variant: 'solid' };
    case 'WAITED':
      return { color: 'purple', label: '返却待ち', variant: 'solid' };
    case 'RETURNED':
      return { color: 'teal', label: '返却済み', variant: 'solid' };
    case 'COMPLETED':
      return { color: 'gray', label: '返却確認完了', variant: 'solid' };
    case 'CANCELLED':
      return { color: 'red', label: 'キャンセル', variant: 'outline' };
    case 'REJECTED':
      return { color: 'red', label: '却下済み', variant: 'solid' };
    default:
      return { color: 'gray', label: status || '不明', variant: 'subtle' };
  }
};

/**
 * 日付文字列から YYYY-MM-DD 形式だけを取り出す
 * ISO 形式 ("2026-04-06T00:00:00.000Z") や通常の日付文字列 ("2026-04-06") に対応
 */
export const formatDateOnly = (dateString: string): string => {
  return dateString ? dateString.substring(0, 10) : dateString;
};

/**
 * 時間文字列をHH:MM形式にフォーマットするヘルパー関数
 */
export const formatTimeToHHMM = (timeString: string): string => {
  try {
    // ISO 8601 形式 (例: "2026-04-06T03:00:00.000Z") はそのまま Date に渡す
    // それ以外 (例: "09:00:00") は日付プレフィックスを付けて変換
    const date = /^\d{4}-\d{2}-\d{2}T/.test(timeString)
      ? new Date(timeString)
      : new Date(`2025-01-01T${timeString}`);
    if (isNaN(date.getTime())) return timeString.substring(0, 5);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Tokyo',
    });
  } catch (error) {
    return timeString.substring(0, 5);
  }
};

/**
 * 日付を日本語形式でフォーマット
 */
export const formatDateToJapanese = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * エラーメッセージを安全に取得
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '予期しないエラーが発生しました';
};

/**
 * デバウンス関数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * オブジェクトが空かどうかをチェック
 */
export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * 配列から重複を除去
 */
export const uniqueArray = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};
