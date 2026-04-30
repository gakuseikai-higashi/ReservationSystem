import { useParams, useNavigate } from 'react-router-dom';
import { useScrollToTop } from '@/shared/hooks/useScrollToTop';
import { Box, VStack, HStack, Card, Text, Button, Heading, Table, Alert } from '@chakra-ui/react';
import PageContainer from '@/shared/components/layout/PageContainer';
import AnimatedCard from '@/shared/components/ui/AnimatedCard';
import PageActions from '@/shared/components/ui/PageActions';
import { LuCalendar, LuClock, LuUsers, LuMapPin, LuUser, LuBuilding2 } from 'react-icons/lu';
import { formatRoomLabel, formatTimeToHHMM, formatDateToJapanese } from '@/shared/utils';
import { useCancelReservation } from '../hooks/useCancelReservation';

export default function Cancel() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // ページロード時にトップにスクロール
  useScrollToTop();

  const { data, loading, cancelling, error, handleCancel } = useCancelReservation(token);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (error) {
    return (
      <Box p={8} maxW="800px" mx="auto">
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>エラー</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
        <Button mt={4} onClick={handleGoBack}>
          戻る
        </Button>
      </Box>
    );
  }

  return (
    <PageContainer
      title="予約キャンセル確認"
      titleColor="red.500"
      subtitle="以下の予約をキャンセルしてもよろしいですか？"
      loading={loading}
    >
      <VStack gap={6} align="stretch">
        {data && (
          <>
            {/* 予約詳細カード */}
            <AnimatedCard delay={0.1}>
              <Card.Header>
                <Heading size="lg">予約詳細</Heading>
              </Card.Header>
              <Card.Body>
                <Table.Root size="md" variant="outline">
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell fontWeight="bold" w="180px">
                        <HStack>
                          <LuUser />
                          <Text>予約者名</Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>{data.reservatorName}</Table.Cell>
                    </Table.Row>

                    {data.clubName && (
                      <Table.Row>
                        <Table.Cell fontWeight="bold">
                          <HStack>
                            <LuBuilding2 />
                            <Text>団体名</Text>
                          </HStack>
                        </Table.Cell>
                        <Table.Cell>{data.clubName}</Table.Cell>
                      </Table.Row>
                    )}

                    <Table.Row>
                      <Table.Cell fontWeight="bold">
                        <HStack>
                          <LuMapPin />
                          <Text>部屋</Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>ミーティングルーム{formatRoomLabel(data.room)}</Table.Cell>
                    </Table.Row>

                    <Table.Row>
                      <Table.Cell fontWeight="bold">
                        <HStack>
                          <LuCalendar />
                          <Text>使用日</Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>{formatDateToJapanese(data.reservationDate)}</Table.Cell>
                    </Table.Row>

                    <Table.Row>
                      <Table.Cell fontWeight="bold">
                        <HStack>
                          <LuClock />
                          <Text>使用時間</Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>{formatTimeToHHMM(data.startTime)} ～ {formatTimeToHHMM(data.endTime)}</Table.Cell>
                    </Table.Row>

                    <Table.Row>
                      <Table.Cell fontWeight="bold">
                        <HStack>
                          <LuUsers />
                          <Text>人数</Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>{data.numPeople}人</Table.Cell>
                    </Table.Row>

                    <Table.Row>
                      <Table.Cell fontWeight="bold">利用目的</Table.Cell>
                      <Table.Cell>{data.purpose}</Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Card.Body>
            </AnimatedCard>

            {/* 注意事項 */}
            <Box>
              <Alert.Root status="warning">
                <Alert.Indicator />
                <Box>
                  <Alert.Title>キャンセルに関する注意</Alert.Title>
                  <Alert.Description>
                    • キャンセル後は同じ時間帯の予約を再度取ることはできません
                    <br />
                    • キャンセルの取り消しはできません
                    <br />
                    • 緊急時を除き、使用日の3日前までにキャンセルしてください
                  </Alert.Description>
                </Box>
              </Alert.Root>
            </Box>

            <PageActions delay={0.3}>
              <Button size="lg" variant="outline" onClick={handleGoBack} disabled={cancelling}>
                戻る
              </Button>
              <Button
                size="lg"
                colorScheme="red"
                onClick={handleCancel}
                loading={cancelling}
                loadingText="キャンセル中..."
              >
                予約をキャンセルする
              </Button>
            </PageActions>
          </>
        )}
      </VStack>
    </PageContainer>
  );
}
