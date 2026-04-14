import {
  ReservationCreateRequest,
  ReservationDetailResponse,
  ReservationListResponse,
  ReservationTimeResponse,
  AvailableTime,
} from '../../../shared/types';
import { authenticatedApiRequest, apiRequest, ApiError } from '../../../shared/api';
import { TIME_TABLE, APP_CONFIG } from '../../../shared/constants';
import { formatTimeToHHMM, formatDateOnly } from '../../../shared/utils';

const backendUrl = APP_CONFIG.BACKEND_URL;

/**
 * 予約を作成
 */
export const createReservation = async (formData: ReservationCreateRequest) => {
  const query = `${backendUrl}/api/reservations/create`;

  const response = await apiRequest(query, {
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
    throw new ApiError(`予約作成に失敗しました: ${response.status}`);
  }

  return response;
};

/**
 * 利用可能な時間帯を取得
 */
export const fetchAvailableTimes = async (
  reservationDate: string,
  room: string,
): Promise<AvailableTime[]> => {
  const query = `${backendUrl}/api/reservations/${room}?date=${reservationDate}`;

  const response = await apiRequest(query);

  if (!response.ok) {
    throw new ApiError(`利用可能時間の取得に失敗しました: ${response.status}`);
  }

  const data: ReservationTimeResponse[] = await response.json();
  const availableTimes: AvailableTime[] = TIME_TABLE.map((time: AvailableTime) => ({
    ...time,
  }));

  for (const { startTime: reservationStart, endTime: reservationEnd } of data) {
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

/**
 * 全ての予約を取得
 */
export const getAllReservations = async (): Promise<ReservationListResponse[]> => {
  const query = `${backendUrl}/api/reservations/all`;

  const response = await authenticatedApiRequest(query);

  if (!response.ok) {
    throw new ApiError(`予約一覧の取得に失敗しました: ${response.status}`);
  }

  const data = await response.json();
  return data.map(
    ({
      reservatorName: reservatorName,
      clubName: clubName,
      numPeople: numPeople,
      reservationDate: reservationDate,
      startTime: startTime,
      endTime: endTime,
      id,
      status,
      room,
      purpose,
      ...rest
    }: {
      reservatorName: string;
      clubName?: string;
      numPeople: number;
      reservationDate: string;
      startTime: string;
      endTime: string;
      id: number;
      status: string;
      room: string;
      purpose: string;
      [key: string]: any;
    }) =>
      ({
        id,
        status,
        reservatorName,
        clubName,
        numPeople,
        room: room as any,
        purpose,
        reservationDate: formatDateOnly(reservationDate),
        date: formatDateOnly(reservationDate),
        startTime: formatTimeToHHMM(startTime),
        endTime: formatTimeToHHMM(endTime),
        ...rest,
      } as ReservationListResponse),
  );
};

/**
 * 予約詳細を取得
 */
export const getReservationDetail = async (id: number): Promise<ReservationDetailResponse> => {
  const query = `${backendUrl}/api/reservations/detail/${id}`;

  const response = await authenticatedApiRequest(query);

  if (!response.ok) {
    throw new ApiError(`予約詳細の取得に失敗しました: ${response.status}`);
  }

  const data = await response.json();
  return {
    startTime: formatTimeToHHMM(data.startTime),
    endTime: formatTimeToHHMM(data.endTime),
    reservationDate: formatDateOnly(data.reservationDate),
    createdAt: new Date(data.createdAt).toLocaleDateString(),
    roomPassword: data.room_password,
    actualReturnTime: data.actualReturnTime,
    returnImageUrls: data.returnImageUrls,
    ...data,
  } as ReservationDetailResponse;
};

/**
 * 予約ステータスを更新
 */
export const updateReservationStatus = async (id: number, status: string) => {
  const query = `${backendUrl}/api/reservations/detail/${id}/${status}`;

  const response = await authenticatedApiRequest(query, {
    method: 'PUT',
  });

  if (!response.ok) {
    const errorText = JSON.parse(await response.text()) as { detail: string };
    console.error(`Status: ${response.status}, Error: ${errorText}`);
    throw new ApiError(
      `予約状態の更新に失敗しました: ${response.status} ${errorText.detail}`,
      response.status,
      response,
    );
  }

  return response;
};

/**
 * 予約を削除
 */
export const deleteReservation = async (id: number) => {
  const query = `${backendUrl}/api/reservations/detail/${id}`;

  const response = await authenticatedApiRequest(query, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = JSON.parse(await response.text()) as { detail: string };
    console.error(`Status: ${response.status}, Error: ${errorText}`);
    throw new ApiError(
      `予約削除に失敗しました: ${response.status} ${errorText.detail}`,
      response.status,
      response,
    );
  }

  return response;
};
