import { useEffect, useState } from 'react';
import { Box, Stack, Table, VStack, Button, HStack, Badge, Tabs } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  LuRefreshCw,
  LuClock,
  LuCheck,
  LuPlay,
  LuPackage,
  LuX,
  LuTable,
  LuCalendar,
  LuArrowUpDown,
} from 'react-icons/lu';
import ReservationsTablePagination from './ReservationsTablePagination';
import ReservationCalendar from './ReservationCalendar';
import { getAllReservations } from '@/lib/functions';
import { ReservationListResponse } from '@/shared/types';
import { formatRoomLabel, getStatusBadgeInfo } from '@/shared/utils';
import ReservationDetail from './ReservationDetail';

const MotionTableRow = motion.create(Table.Row);

export default function ReservationsTable() {
  const [data, setData] = useState<ReservationListResponse[]>([]);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 現在時刻と予約時間から実際の使用状態を判定する関数
  const getActualStatus = (item: ReservationListResponse) => {
    // 既に完了済みの状態の場合は元の状態のまま
    const currentStatus = String(item.status);
    if (
      currentStatus === 'RETURNED' ||
      currentStatus === 'COMPLETED' ||
      currentStatus === 'CANCELLED' ||
      currentStatus === 'REJECTED'
    ) {
      return currentStatus;
    }

    const now = new Date();

    // 予約日をDateオブジェクトに変換
    const reservationDate = new Date(item.reservationDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const reservationDay = new Date(
      reservationDate.getFullYear(),
      reservationDate.getMonth(),
      reservationDate.getDate(),
    );

    // 過去の予約で承認済みの場合は返却待ちとする
    if (reservationDay < today && currentStatus === 'APPROVED') {
      return 'WAITED';
    }

    // 今日以外の予約は元の状態のまま
    if (reservationDay.getTime() !== today.getTime()) {
      return currentStatus;
    }

    // 時刻文字列を比較用の数値に変換（分単位）
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const currentMinutes = now.getDate() * 24 * 60 + now.getHours() * 60 + now.getMinutes();
    const startMinutes =
      new Date(item.reservationDate).getDate() * 24 * 60 + timeToMinutes(item.startTime);
    const endMinutes =
      new Date(item.reservationDate).getDate() * 24 * 60 + timeToMinutes(item.endTime);

    // 使用開始前
    if (currentMinutes < startMinutes) {
      return 'APPROVED';
    }

    // 使用時間内
    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return 'USING';
    }

    // 使用時間終了後
    if (currentMinutes >= endMinutes) {
      return 'WAITED';
    }

    return currentStatus;
  };

  // 予約状態に応じたバッジの色・ラベル・アイコンを返す関数
  const getStatusBadgeProps = (status: string) => {
    const { color, label, variant } = getStatusBadgeInfo(status);
    const iconMap: Record<string, React.ReactNode> = {
      'PENDING':   <LuClock size={12} />,
      'APPROVED':  <LuCheck size={12} />,
      'USING':     <LuPlay size={12} />,
      'WAITED':    <LuClock size={12} />,
      'RETURNED':  <LuPackage size={12} />,
      'COMPLETED': <LuPackage size={12} />,
      'CANCELLED': <LuX size={12} />,
      'REJECTED':  <LuX size={12} />,
    };
    return { colorPalette: color, variant, text: label, icon: iconMap[status] ?? null };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllReservations();
      setData(res);
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [reload]);

  // リアルタイム更新のため1分ごとにデータを再取得
  useEffect(() => {
    const interval = setInterval(() => {
      // 現在表示中のページがある場合のみ自動更新
      if (!loading) {
        fetchData();
      }
    }, 60000); // 1分間隔

    return () => clearInterval(interval);
  }, [loading]);

  const handleRefresh = () => {
    setReload(!reload);
  };

  const [openDetailId, setOpenDetailId] = useState<number | null>(null);

  const onCloseDetail = () => {
    setOpenDetailId(null);
    setReload(!reload);
  };

  const [currentPage, setCurrentPage] = useState<number>(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const itemsPerPage = 10;
  const itemLength = data.length;
  const totalPages = Math.max(Math.ceil(itemLength / itemsPerPage), 1);
  const startIndex = (currentPage - 1) * itemsPerPage;

  // IDでソート
  const sortedData = [...data].sort((a, b) => {
    return sortOrder === 'desc' ? b.id - a.id : a.id - b.id;
  });

  const paginatedItems = sortedData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <VStack width="100%">
      {/* 更新ボタンと表示切り替え */}
      <HStack width="100%" justify="space-between" mb={2} gap={2}>
        <Tabs.Root
          value={viewMode}
          onValueChange={(e) => setViewMode(e.value as 'table' | 'calendar')}
        >
          <Tabs.List>
            <Tabs.Trigger value="table" fontSize={{ base: 'xs', md: 'sm' }}>
              <Box display={{ base: 'none', md: 'inline' }} mr={1}>
                <LuTable />
              </Box>
              テーブル
            </Tabs.Trigger>
            <Tabs.Trigger value="calendar" fontSize={{ base: 'xs', md: 'sm' }}>
              <Box display={{ base: 'none', md: 'inline' }} mr={1}>
                <LuCalendar />
              </Box>
              カレンダー
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>

        <Button
          onClick={handleRefresh}
          colorScheme="blue"
          size="sm"
          variant="outline"
          loading={loading}
          px={{ base: 2, md: 4 }}
        >
          <LuRefreshCw />
          <Box display={{ base: 'none', md: 'inline' }} ml={1}>
            更新
          </Box>
        </Button>
      </HStack>

      {/* テーブル表示 */}
      {viewMode === 'table' && (
        <>
          {/* テーブル本体：高さを固定し、中でスクロール */}
          <Box
            width="100%"
            overflowY="auto"
            border="1px solid"
            borderColor="gray.50"
            borderRadius="md"
            minH={`${Math.min(paginatedItems.length, 10) * 1.6 + 3}rem`}
          >
            <Table.ScrollArea borderWidth="1px">
              <Table.Root
                size="sm"
                variant="outline"
                bg="gray.100"
                rounded="2px"
                overflowX="scroll"
                stickyHeader
                interactive
                showColumnBorder
              >
                <Table.ColumnGroup>
                  <Table.Column htmlWidth="5%" />
                </Table.ColumnGroup>
                <Table.Header fontSize="0.8rem">
                  <Table.Row>
                    <Table.ColumnHeader textAlign="center" fontWeight="bold" bg="gray.300">
                      <HStack justify="center" gap={1}>
                        <span>ID</span>
                        <Box
                          as="button"
                          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                          cursor="pointer"
                          _hover={{ color: 'blue.500' }}
                        >
                          <LuArrowUpDown size={12} />
                        </Box>
                      </HStack>
                    </Table.ColumnHeader>
                    {[
                      '団体名',
                      '予約者氏名',
                      '人数',
                      '部屋',
                      '使用日',
                      '使用開始時間',
                      '使用終了時間',
                      '状態',
                    ].map((header, idx) => (
                      <Table.ColumnHeader
                        key={idx}
                        textAlign="center"
                        fontWeight="bold"
                        bg="gray.300"
                      >
                        {header}
                      </Table.ColumnHeader>
                    ))}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedItems.map((item, index) => (
                    <MotionTableRow
                      height="1.6rem"
                      // chakra用
                      fontSize="0.8rem"
                      transitionProperty="background-color"
                      transitionDuration="0.1s"
                      transitionTimingFunction="ease-out"
                      // framer-motion用
                      key={item.id}
                      initial={{ opacity: 0, x: 0, y: 4 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: 'easeOut',
                      }}
                      layout
                      onClick={() => setOpenDetailId(item.id)}
                    >
                      <Table.Cell textAlign="center">{item.id}</Table.Cell>
                      <Table.Cell textAlign="center">{item.clubName || '個人利用'}</Table.Cell>
                      <Table.Cell textAlign="center">{item.reservatorName}</Table.Cell>
                      <Table.Cell textAlign="center">{item.numPeople}</Table.Cell>
                      <Table.Cell textAlign="center">{formatRoomLabel(item.room)}</Table.Cell>
                      <Table.Cell textAlign="center">{item.reservationDate}</Table.Cell>
                      <Table.Cell textAlign="center">{item.startTime}</Table.Cell>
                      <Table.Cell textAlign="center">{item.endTime}</Table.Cell>
                      <Table.Cell textAlign="center">
                        {(() => {
                          const actualStatus = getActualStatus(item);
                          const badgeProps = getStatusBadgeProps(actualStatus);
                          return (
                            <Badge
                              colorPalette={badgeProps.colorPalette}
                              variant={badgeProps.variant}
                              size="sm"
                              display="inline-flex"
                              alignItems="center"
                              gap={1}
                            >
                              {badgeProps.icon}
                              {badgeProps.text}
                            </Badge>
                          );
                        })()}
                      </Table.Cell>
                    </MotionTableRow>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </Box>

          {/* ページネーションは常に下に固定 */}
          <Stack align="center" width="100%" my={4}>
            <ReservationsTablePagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              itemLength={itemLength}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </Stack>
        </>
      )}

      {/* カレンダー表示 */}
      {viewMode === 'calendar' && (
        <ReservationCalendar data={sortedData} onSelectReservation={setOpenDetailId} />
      )}

      {openDetailId && <ReservationDetail id={openDetailId} onClose={onCloseDetail} />}
    </VStack>
  );
}
