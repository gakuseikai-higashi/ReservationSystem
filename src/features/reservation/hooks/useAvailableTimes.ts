import { useCallback, useEffect, useState } from 'react';
import { fetchAvailableTimes } from '@/lib/functions';
import { AvailableTime, ReservationCreateRequest } from '@/shared/types';
import { TIME_TABLE } from '@/shared/constants';

export const useAvailableTimes = (
  reservationDate: string,
  room: string,
  restoredData?: ReservationCreateRequest,
) => {
  const [availableTimes, setAvailableTimes] = useState<AvailableTime[]>(TIME_TABLE);

  const getAvailableTime = useCallback(
    async (date: string, roomVal: string, retryCount = 0) => {
      const maxRetries = 3;
      try {
        const result = await fetchAvailableTimes(date, roomVal);
        setAvailableTimes(result);
      } catch (error) {
        console.error(`利用可能時間の取得に失敗しました (${retryCount + 1}/${maxRetries}):`, error);
        if (retryCount < maxRetries - 1) {
          setTimeout(() => {
            getAvailableTime(date, roomVal, retryCount + 1);
          }, 1000 * (retryCount + 1));
        } else {
          console.error('最大リトライ回数に達しました');
          setAvailableTimes(TIME_TABLE);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (reservationDate && room) {
      getAvailableTime(reservationDate, room);
    } else {
      setAvailableTimes(TIME_TABLE);
    }
  }, [reservationDate, room, getAvailableTime]);

  useEffect(() => {
    if (restoredData?.reservationDate && restoredData?.room) {
      getAvailableTime(restoredData.reservationDate, restoredData.room);
    }
  }, [restoredData, getAvailableTime]);

  return { availableTimes };
};
