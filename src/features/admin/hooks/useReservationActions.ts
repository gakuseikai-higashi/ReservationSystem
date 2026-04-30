import { useCallback, useState } from 'react';
import { updateReservationStatusAsAdmin, deleteReservation } from '@/lib/functions';
import { ReservationDetailResponse, ReservationStatus } from '@/shared/types';
import { formatRoomLabel, formatTimeToHHMM, formatDateOnly } from '@/shared/utils';
import { APP_CONFIG } from '@/shared/constants';

export const buildGmailUrl = (
  action: 'approve' | 'reject',
  data: ReservationDetailResponse,
): string => {
  const isApprove = action === 'approve';
  const subject = isApprove
    ? `【承認】ミーティングルーム予約のお知らせ`
    : `【却下】ミーティングルーム予約のお知らせ`;

  const reservationInfo = [
    '━━━━━━━━━━━━━━━━━━━━━━',
    '【予約内容】',
    `部屋：${formatRoomLabel(data.room)}`,
    `日時：${formatDateOnly(data.reservationDate)}　${formatTimeToHHMM(data.startTime)} 〜 ${formatTimeToHHMM(data.endTime)}`,
    `利用人数：${data.numPeople}名`,
    `目的：${data.purpose}`,
    '━━━━━━━━━━━━━━━━━━━━━━',
  ].join('\n');

  const baseUrl = window.location.origin;
  const cancelUrl = `${baseUrl}/cancel/${data.token}`;
  const returnUrl = `${baseUrl}/return/${data.token}`;

  const signature = '\n\n神戸商科キャンパス 学生会';

  const body = isApprove
    ? `${data.reservatorName} 様\n\nこの度はご予約いただきありがとうございます。\n以下の予約が承認されましたのでお知らせいたします。\n\n${reservationInfo}\n\nご利用当日は時間厳守でお願いいたします。\n\n■ 返却手続き（利用終了後にこちらから）\n${returnUrl}\n\n■ キャンセルはこちら\n${cancelUrl}\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\nよろしくお願いいたします。${signature}`
    : `${data.reservatorName} 様\n\nこの度はご予約いただきありがとうございます。\n誠に申し訳ありませんが、以下のご予約については却下となりましたのでお知らせいたします。\n\n${reservationInfo}\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\nよろしくお願いいたします。${signature}`;

  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: data.email,
    su: subject,
    body,
    ...(APP_CONFIG.GMAIL_SENDER && { authuser: APP_CONFIG.GMAIL_SENDER }),
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
};

export const useReservationActions = (
  id: number,
  onClose: () => void,
  data?: ReservationDetailResponse,
) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsApproving(true);
    try {
      if (data?.status === ReservationStatus.RETURNED) {
        await updateReservationStatusAsAdmin(id, 'complete');
      } else {
        await updateReservationStatusAsAdmin(id, 'approve');
        if (data) window.open(buildGmailUrl('approve', data), '_blank');
      }
      onClose();
    } catch (error) {
      console.error('予約承認に失敗しました:', error);
    } finally {
      setIsApproving(false);
    }
  }, [id, onClose, data]);

  const handleReject = useCallback(async () => {
    setIsRejecting(true);
    try {
      await updateReservationStatusAsAdmin(id, 'reject');
      if (data) window.open(buildGmailUrl('reject', data), '_blank');
      onClose();
    } catch (error) {
      console.error('予約却下に失敗しました:', error);
    } finally {
      setIsRejecting(false);
    }
  }, [id, onClose, data]);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      await deleteReservation(id);
      onClose();
    } catch (error) {
      console.error('予約削除に失敗しました:', error);
    } finally {
      setShowDeleteConfirm(false);
    }
  }, [id, onClose]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  return {
    showDeleteConfirm,
    handleConfirm,
    handleReject,
    handleDelete,
    confirmDelete,
    cancelDelete,
    isApproving,
    isRejecting,
  };
};
