import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReservationCancelReturnPageData, updateReservationStatus } from '@/lib/functions';
import { ApiError } from '@/lib/api';
import { ReservationDetailResponse } from '@/shared/types';

export const useReturnReservation = (token: string | undefined) => {
  const navigate = useNavigate();
  const [data, setData] = useState<ReservationDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('無効なトークンです');
        return;
      }
      setLoading(true);
      try {
        const fetchedData = await getReservationCancelReturnPageData('return', token);
        setData(fetchedData);
      } catch (error) {
        console.error(error);
        setError(`${(error as Error).message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleReturn = async (
    selectedFiles: File[],
    damageDetails: string,
    allChecklistCompleted: boolean,
    onError: (msg: string) => void,
  ) => {
    if (!data) return;
    if (!allChecklistCompleted) {
      onError('全てのチェック項目を確認してください');
      return;
    }
    if (selectedFiles.length === 0) {
      onError('返却画像をアップロードしてください');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('damageDetails', damageDetails);
      selectedFiles.forEach((file) => {
        formData.append('returnImages', file, file.name);
      });
      for (const entry of formData.entries()) {
        console.log(entry);
      }
      await updateReservationStatus(data.id, 'return', formData);
      navigate(`/complete/${token}`, {
        state: { message: '返却が完了しました', type: 'return' },
      });
    } catch (error) {
      console.error('返却処理に失敗しました:', error);
      if (error instanceof ApiError && error.status === 403) {
        const detail = error.message.split(': ').slice(1).join(': ');
        onError(detail || '活動時間が開始してからでないと返却できません。開始時刻以降に再度お試しください。');
      } else if (error instanceof Error) {
        if (error.message.includes('変換に失敗')) {
          onError(error.message);
        } else if (error.message.includes('ネットワーク')) {
          onError('ネットワークエラーが発生しました。インターネット接続を確認してください。');
        } else {
          onError(`返却処理に失敗しました: ${error.message}`);
        }
      } else {
        onError('予期しないエラーが発生しました。しばらく経ってから再度お試しください。');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { data, loading, submitting, error, setError, handleReturn };
};
