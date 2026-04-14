/**
 * 予約ステータス
 */
export enum ReservationStatus {
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WAITED = 'WAITED',
  RETURNED = 'RETURNED',
  COMPLETED = 'COMPLETED',
  USING = 'USING', // 使用中（フロントエンド内部管理）
}

/**
 * 部屋タイプ
 */
export enum ReservationRoom {
  LARGE = 'LARGE', // ミーティングルーム大
  SMALL = 'SMALL', // ミーティングルーム小
}

/**
 * 予約メタデータ基底インターフェース
 */
interface ReservationMetadataBase {
  id: number;
  status: ReservationStatus;
  createdAt: string;
}

/**
 * 予約者基本情報インターフェース
 */
interface ReservatorInfoBase {
  reservatorName: string;
  clubName?: string;
}

/**
 * 予約者詳細情報インターフェース
 */
interface ReservatorDetailInfoBase {
  studentId: string;
  email: string;
  phoneNumber: string;
}

/**
 * 予約情報基底インターフェース
 */
interface ReservationInfoBase {
  room: ReservationRoom;
  purpose: string;
  numPeople: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
}

/**
 * 返却情報基底インターフェース
 */
interface ReservationReturnInfoBase {
  returnTime?: string;
  returnImageUrls?: string[];
}

/**
 * 予約トークン基底インターフェース
 */
interface ReservationTokenBase {
  token: string;
}

/**
 * 予約作成リクエスト
 */
export interface ReservationCreateRequest
  extends Omit<ReservatorInfoBase, 'reservatorName'>,
    ReservatorDetailInfoBase,
    ReservationInfoBase {
  firstName: string;
  lastName: string;
}

/**
 * 予約返却リクエスト
 */
export interface ReservationReturnRequest
  extends Pick<ReservationMetadataBase, 'id'>,
    ReservationReturnInfoBase {}

/**
 * 予約作成レスポンス
 */
export interface ReservationCreateResponse extends ReservationTokenBase {}

/**
 * 予約一覧レスポンス
 */
export interface ReservationListResponse
  extends Pick<ReservationMetadataBase, 'id' | 'status'>,
    ReservatorInfoBase,
    ReservationInfoBase {}

/**
 * 予約詳細レスポンス
 */
export interface ReservationDetailResponse
  extends ReservationMetadataBase,
    ReservatorInfoBase,
    ReservatorDetailInfoBase,
    ReservationInfoBase,
    ReservationReturnInfoBase,
    ReservationTokenBase {}

/**
 * 予約キャンセル・返却ページレスポンス
 */
export interface ReservationCancelReturnPageResponse
  extends Pick<ReservationMetadataBase, 'id'>,
    ReservatorInfoBase,
    ReservationInfoBase {}

/**
 * 予約時間レスポンス
 */
export interface ReservationTimeResponse {
  startTime: Date;
  endTime: Date;
}

/**
 * 利用可能時間
 */
export interface AvailableTime {
  startTime: string;
  endTime: string;
  isAvailable?: boolean | undefined;
}
