import { Box, VStack, HStack, Card, Text, Button, Heading, Alert } from '@chakra-ui/react';
import { LuUser, LuCalendar, LuClock, LuArrowLeft } from 'react-icons/lu';
import { useScrollToTop } from '@/shared/hooks/useScrollToTop';
import PageContainer from '@/shared/components/layout/PageContainer';
import AnimatedCard from '@/shared/components/ui/AnimatedCard';
import PageActions from '@/shared/components/ui/PageActions';
import { InputValue } from '@/shared/components/form/InputValue';
import { InputText } from '@/shared/components/form/InputText';
import { SelectItems } from '@/shared/components/form/SelectItems';
import { ShowAvailableTime } from '../components/ShowAvailableTime';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { DATE_UNTIL_NEXT_MONTH, TIME_TABLE } from '@/shared/constants';
import { ReservationCreateRequest } from '@/shared/types';
import { formatRoomLabel } from '@/shared/utils';
import { useAvailableTimes } from '../hooks/useAvailableTimes';

export default function Reservation() {
  const navigate = useNavigate();
  const location = useLocation();

  // ページロード時にトップにスクロール
  useScrollToTop();

  // 確認ページから戻った場合の復元データを取得
  const restoredData = location.state?.reservationData as ReservationCreateRequest | undefined;

  const methods = useForm<ReservationCreateRequest>({
    defaultValues: restoredData || {},
  });
  const onSubmit = (data: ReservationCreateRequest) => {
    console.log(data);
    navigate('/reserve/confirmation', { state: { reservationData: data } });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const reservationDate = methods.watch('reservationDate');
  const room = methods.watch('room');
  const startTime = methods.watch('startTime');

  const { availableTimes } = useAvailableTimes(reservationDate, room, restoredData);

  const studentIdPattern = /^[A-Z]{2}\d{2}[A-Z]\d{3}$/;
  const studentIdMessage = '学籍番号の形式が不正です（例: AB00C000）';

  const phoneNumberPattern = /^[0-9]{10,11}$/;
  const phoneNumberMessage = '電話番号の形式が不正です（例: 09012345678）';

  return (
    <PageContainer
      title="部室棟予約システム"
      titleColor="blue.600"
      subtitle="予約情報を入力してください"
    >
      <VStack gap={4} align="stretch">
        <FormProvider<ReservationCreateRequest> {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {/* 予約者情報カード */}
            <Box mb={4}>
              <AnimatedCard delay={0.1}>
                <Card.Header>
                  <Heading size="lg">
                    <HStack>
                      <LuUser />
                      <Text>予約者情報</Text>
                    </HStack>
                  </Heading>
                </Card.Header>
                <Card.Body>
                  <VStack gap={4} align="stretch">
                    <InputValue
                      label="団体名"
                      formLabel="clubName"
                      placeholder="個人利用の場合は空欄"
                    />
                    <HStack gap={4} align="end" flexDirection={{ base: 'column', md: 'row' }}>
                      <Box flex={1} w="full">
                        <InputValue label="姓" formLabel="firstName" placeholder="山田" required />
                      </Box>
                      <Box flex={1} w="full">
                        <InputValue label="名" formLabel="lastName" placeholder="太郎" required />
                      </Box>
                    </HStack>
                    <InputValue
                      label="学籍番号"
                      formLabel="studentId"
                      patternValue={studentIdPattern}
                      patternMessage={studentIdMessage}
                      placeholder="AB00C000"
                      required
                    />
                    <InputValue
                      label="メールアドレス"
                      formLabel="email"
                      type="email"
                      placeholder="example@email.com"
                      required
                    />
                    <InputValue
                      label="電話番号"
                      formLabel="phoneNumber"
                      patternValue={phoneNumberPattern}
                      patternMessage={phoneNumberMessage}
                      type="tel"
                      placeholder="ハイフン無し半角数字で入力"
                      required
                    />
                  </VStack>
                </Card.Body>
              </AnimatedCard>
            </Box>

            {/* 予約詳細カード */}
            <Box mb={4}>
              <AnimatedCard delay={0.2}>
                <Card.Header>
                  <Heading size="lg">
                    <HStack>
                      <LuCalendar />
                      <Text>予約詳細</Text>
                    </HStack>
                  </Heading>
                </Card.Header>
                <Card.Body>
                  <VStack gap={4} align="stretch">
                    <SelectItems
                      label="使用日"
                      formLabel="reservationDate"
                      items={DATE_UNTIL_NEXT_MONTH}
                      description="使用する日付を選択"
                      required
                    />
                    <SelectItems
                      label="使用部屋"
                      formLabel="room"
                      items={['大', '小']}
                      values={['LARGE', 'SMALL']}
                      description="ミーティングルーム（大・小）から選択"
                      required
                    />
                    <SelectItems
                      label="人数"
                      formLabel="numPeople"
                      items={Array.from({ length: 50 }, (_, i) => String(i + 1))}
                      description="1~50から選択"
                      required
                    />
                    <Box>
                      <InputText
                        label="使用目的"
                        formLabel="purpose"
                        placeholder="会議、勉強会、打ち合わせなど"
                        required
                      />
                    </Box>
                  </VStack>
                </Card.Body>
              </AnimatedCard>
            </Box>

            {/* 利用可能時間カード */}
            <Box mb={4}>
              <AnimatedCard delay={0.3}>
                <Card.Header>
                  <Heading size="lg">
                    <HStack>
                      <LuClock />
                      <Text>利用可能時間</Text>
                    </HStack>
                  </Heading>
                  {reservationDate && room && (
                    <Text color="gray.600" fontSize="sm" mt={2}>
                      選択中: {reservationDate} / ミーティングルーム{formatRoomLabel(room)}
                    </Text>
                  )}
                </Card.Header>
                <Card.Body>
                  <VStack gap={4} align="stretch">
                    {reservationDate && room ? (
                      <Box
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        p={4}
                        bg="gray.50"
                      >
                        <ShowAvailableTime items={availableTimes} split={2} />
                      </Box>
                    ) : (
                      <Alert.Root status="info">
                        <Alert.Indicator />
                        <Alert.Description>
                          使用日と部屋を選択すると、利用可能時間が表示されます
                        </Alert.Description>
                      </Alert.Root>
                    )}

                    <SelectItems
                      label="開始時間"
                      formLabel="startTime"
                      items={TIME_TABLE.map((t) => t.startTime)}
                      description="利用可能な時間から選択"
                      disabled={availableTimes[0].isAvailable === undefined}
                      required
                    />
                    <SelectItems
                      label="終了時間"
                      formLabel="endTime"
                      items={TIME_TABLE.filter((t) => t.endTime > startTime).map((t) => t.endTime)}
                      description="開始時間より後の時間を選択"
                      disabled={
                        availableTimes[0].isAvailable === undefined || startTime === undefined
                      }
                      required
                    />
                  </VStack>
                </Card.Body>
              </AnimatedCard>
            </Box>

            {/* 注意事項 */}
            <Box mb={6}>
              <Alert.Root status="info">
                <Alert.Indicator />
                <Box>
                  <Alert.Title>予約に関する注意事項</Alert.Title>
                  <Alert.Description>
                    • 予約申請後、管理者による承認が必要です
                    <br />
                    • 承認結果はメールでお知らせします
                    <br />
                    • 利用後は必ず部屋の清掃・整理整頓をお願いします
                    <br />• キャンセルは使用日の前日までにお願いします
                  </Alert.Description>
                </Box>
              </Alert.Root>
            </Box>

            {/* 送信ボタン */}
            <PageActions delay={0.5}>
              <VStack w="full" gap={3}>
                {/* メインボタン（中央配置） */}
                <Box w="full" position="relative">
                  {/* ホームに戻るボタン（PC: 左寄せ、スマホ: 非表示） */}
                  <Box
                    position="absolute"
                    left={0}
                    top="50%"
                    transform="translateY(-50%)"
                    display={{ base: 'none', md: 'block' }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGoHome}
                      color="gray.400"
                      fontSize="xs"
                      _hover={{ color: 'gray.600' }}
                    >
                      <HStack gap={1}>
                        <LuArrowLeft size="12px" />
                        <Text>ホームに戻る</Text>
                      </HStack>
                    </Button>
                  </Box>

                  <Box textAlign="center">
                    <Button size="xl" type="submit" colorScheme="blue" px={12}>
                      予約内容を確認する
                    </Button>
                  </Box>
                </Box>

                {/* ホームに戻るボタン（スマホ: 下部表示、PC: 非表示） */}
                <Box display={{ base: 'block', md: 'none' }} w="full" textAlign="center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGoHome}
                    color="gray.400"
                    fontSize="xs"
                    _hover={{ color: 'gray.600' }}
                  >
                    <HStack gap={1}>
                      <LuArrowLeft size="12px" />
                      <Text>ホームに戻る</Text>
                    </HStack>
                  </Button>
                </Box>
              </VStack>
            </PageActions>
          </form>
        </FormProvider>
      </VStack>
    </PageContainer>
  );
}
