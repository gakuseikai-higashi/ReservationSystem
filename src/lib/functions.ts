import { TIME_TABLE } from '../shared/constants';
import {
  AvailableTime,
  ReservationCreateRequest,
  ReservationCreateResponse,
  ReservationDetailResponse,
  ReservationListResponse,
  ReservationTimeResponse,
} from '@/shared/types';
import { authenticatedApiRequest, ApiError, apiRequest } from './api';
import { formatDateOnly } from '@/shared/utils';
import { APP_CONFIG } from '@/shared/constants';

const backendUrl = APP_CONFIG.BACKEND_URL;

// 共通のエラー処理関数
const handleApiError = async (response: Response, operation: string) => {
  const errorText = await response.text();
  let errorDetail: string;

  try {
    const errorData = JSON.parse(errorText);
    errorDetail = errorData.detail || errorText;
  } catch {
    errorDetail = errorText;
  }

  console.error(`Status: ${response.status}, Error: ${errorDetail}`);
  alert(`${operation}に失敗しました\nMessage: ${errorDetail}`);
  throw new ApiError(`${operation}に失敗しました: ${errorDetail}`);
};

// 時間文字列をHH:MM形式にフォーマットするヘルパー関数
const formatTimeToHHMM = (timeString: string): string => {
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

// 予約作成API
export const createReservation = async (
  formData: ReservationCreateRequest,
  retryCount = 0,
  maxRetries = 2,
): Promise<ReservationCreateResponse> => {
  const query = `${backendUrl}/api/reservations/create`;

  try {
    const response = await fetch(query, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reservatorName: formData.firstName + ' ' + formData.lastName,
        studentId: formData.studentId,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        clubName: formData.clubName,
        room: formData.room,
        purpose: formData.purpose,
        numPeople: Number(formData.numPeople),
        reservationDate: formData.reservationDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
      }),
    });

    if (!response.ok) {
      // リトライ可能な場合はリトライする
      if (retryCount < maxRetries) {
        console.log(`リトライを実行します... (${retryCount + 1}/${maxRetries})`);
        // 短時間待機してリトライ
        await new Promise((resolve) => setTimeout(resolve, 500 * (retryCount + 1)));
        return createReservation(formData, retryCount + 1, maxRetries);
      }

      // 最大リトライ回数に達した場合は統一されたエラーハンドリング
      await handleApiError(response, '予約の作成');
    }

    const data = (await response.json()) as ReservationCreateResponse;
    console.log(`予約作成成功 (試行 ${retryCount + 1}/${maxRetries + 1})`);
    return data;
  } catch (error) {
    // ネットワークエラーなどの場合もリトライする
    if (retryCount < maxRetries && !(error instanceof ApiError)) {
      console.log(
        `ネットワークエラーによりリトライを実行します... (${retryCount + 1}/${maxRetries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, 500 * (retryCount + 1)));
      return createReservation(formData, retryCount + 1, maxRetries);
    }

    // ApiErrorまたは最大リトライ回数に達した場合はそのまま投げる
    throw error;
  }
};

// 利用可能な時間帯を取得
export const fetchAvailableTimes = async (
  reservationDate: string,
  room: string,
): Promise<AvailableTime[]> => {
  const query = `${backendUrl}/api/reservations/${room}?date=${reservationDate}`;
  const response = await fetch(query);

  if (!response.ok) {
    await handleApiError(response, '利用可能時間の取得');
  }

  const data = await response.json();
  const parsedData: ReservationTimeResponse[] = data.map((item: any) => {
    return {
      startTime: new Date(`${item.reservationDate}T${item.startTime}+09:00`),
      endTime: new Date(`${item.reservationDate}T${item.endTime}+09:00`),
    };
  });
  const availableTimes: AvailableTime[] = TIME_TABLE.map((time) => ({
    ...time,
  }));
  for (const { startTime: reservationStart, endTime: reservationEnd } of parsedData) {
    for (let i = 0; i < availableTimes.length; i++) {
      const { startTime, endTime } = availableTimes[i];
      const timeSlot = {
        startTime: new Date(`${reservationDate}T${startTime}:00+09:00`),
        endTime: new Date(`${reservationDate}T${endTime}:00+09:00`),
      };

      if (
        (timeSlot.startTime >= reservationStart && timeSlot.startTime < reservationEnd) ||
        (timeSlot.endTime > reservationStart && timeSlot.endTime <= reservationEnd) ||
        (timeSlot.startTime <= reservationStart && timeSlot.endTime >= reservationEnd)
      ) {
        availableTimes[i].isAvailable = false;
      }
    }
  }
  for (let i = 0; i < availableTimes.length; i++) {
    if (availableTimes[i].isAvailable === undefined) {
      availableTimes[i].isAvailable = true;
    }
  }
  return availableTimes;
};

// 予約一覧取得API
export const getAllReservations = async () => {
  const query = `${backendUrl}/api/reservations/all`;

  const response = await authenticatedApiRequest(query);

  if (!response.ok) {
    await handleApiError(response, '予約一覧の取得');
  }

  const data = await response.json();
  const resData = data.map(
    ({
      reservatorName: reservatorName,
      clubName: clubName,
      numPeople: numPeople,
      reservationDate: reservationDate,
      startTime: startTime,
      endTime: endTime,
      ...rest
    }: {
      reservatorName: string;
      clubName?: string;
      numPeople: number;
      reservationDate: string;
      startTime: string;
      endTime: string;
      [key: string]: any;
    }) => {
      return {
        reservatorName,
        clubName,
        numPeople,
        reservationDate: formatDateOnly(reservationDate),
        date: formatDateOnly(reservationDate),
        startTime: formatTimeToHHMM(startTime),
        endTime: formatTimeToHHMM(endTime),
        ...rest,
      } as unknown as ReservationListResponse;
    },
  );
  return resData;
};

// 予約詳細取得API
export const getReservationDetail = async (id: number) => {
  const query = `${backendUrl}/api/reservations/detail/${id}`;

  const response = await authenticatedApiRequest(query);

  if (!response.ok) {
    await handleApiError(response, '予約詳細の取得');
  }

  const data = await response.json();
  const resData = {
    startTime: formatTimeToHHMM(data.startTime),
    endTime: formatTimeToHHMM(data.endTime),
    reservationDate: formatDateOnly(data.reservationDate),
    createdAt: new Date(data.createdAt).toLocaleDateString(),
    actualReturnTime: data.actualReturnTime,
    returnImageUrls: data.returnImageUrls,
    ...data,
  } as ReservationDetailResponse;
  return resData;
};

// 予約状態更新API（認証不要）
export const updateReservationStatus = async (
  id: number,
  action: string,
  body?: FormData | undefined,
) => {
  const query = `${backendUrl}/api/reservations/detail/${id}/${action}`;

  const isFormData = body instanceof FormData;
  const headers: HeadersInit = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
  };

  const response = await apiRequest(query, {
    method: 'PUT',
    headers,
    body,
  });

  if (!response.ok) {
    await handleApiError(response, '予約状態の更新');
  }

  return response;
};

// 予約状態更新API（認証必要 - 管理者用）
export const updateReservationStatusAsAdmin = async (id: number, action: string) => {
  const query = `${backendUrl}/api/reservations/detail/${id}/${action}`;

  const response = await authenticatedApiRequest(query, {
    method: 'PUT',
  });

  if (!response.ok) {
    await handleApiError(response, '予約状態の更新（管理者）');
  }

  return response;
};

// 予約削除API
export const deleteReservation = async (id: number) => {
  const query = `${backendUrl}/api/reservations/detail/${id}`;

  const response = await authenticatedApiRequest(query, {
    method: 'DELETE',
  });

  if (!response.ok) {
    await handleApiError(response, '予約削除');
  }

  return response;
};

// 予約キャンセル・返却確認ページデータ取得API
export const getReservationCancelReturnPageData = async (action: string, token: string) => {
  const query = `${backendUrl}/api/reservations/${action}/${token}`;

  const response = await fetch(query);

  if (!response.ok) {
    await handleApiError(response, 'キャンセルページデータの取得');
  }

  const data = await response.json();
  const resData = {
    startTime: formatTimeToHHMM(data.startTime),
    endTime: formatTimeToHHMM(data.endTime),
    createdAt: new Date(data.createdAt).toLocaleDateString(),
    ...data,
  } as ReservationDetailResponse;
  return resData;
};
