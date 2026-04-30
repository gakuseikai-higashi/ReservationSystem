import { useParams, useNavigate } from 'react-router-dom';
import { useScrollToTop } from '@/shared/hooks/useScrollToTop';
import {
  Box,
  VStack,
  HStack,
  Card,
  Text,
  Button,
  Heading,
  Table,
  Input,
  Image,
  Alert,
  Checkbox,
  Textarea,
  SimpleGrid,
} from '@chakra-ui/react';
import PageContainer from '@/shared/components/layout/PageContainer';
import AnimatedCard from '@/shared/components/ui/AnimatedCard';
import PageActions from '@/shared/components/ui/PageActions';
import {
  LuCalendar,
  LuClock,
  LuUsers,
  LuMapPin,
  LuUser,
  LuBuilding2,
  LuUpload,
  LuImage,
  LuX,
  LuClipboardCheck,
} from 'react-icons/lu';
import { formatDateToJapanese, formatRoomLabel, formatTimeToHHMM } from '@/shared/utils';
import { useReturnReservation } from '../hooks/useReturnReservation';
import { useImageUpload } from '../hooks/useImageUpload';
import { useChecklist } from '../hooks/useChecklist';

export default function Return() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // ページロード時にトップにスクロール
  useScrollToTop();

  const { data, loading, submitting, error, setError, handleReturn: doReturn } = useReturnReservation(token);
  const {
    fileInputRef,
    selectedFiles,
    previewUrls,
    error: uploadError,
    setError: setUploadError,
    handleFileSelect,
    handleFileRemove,
  } = useImageUpload();
  const { checklist, damageDetails, setDamageDetails, handleChecklistChange, allChecklistCompleted } =
    useChecklist();

  const displayError = error || uploadError;
  const clearErrors = () => { setError(''); setUploadError(''); };

  const handleReturn = () => {
    clearErrors();
    doReturn(selectedFiles, damageDetails, allChecklistCompleted, (msg) => {
      setError(msg);
    });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (displayError && !data) {
    const [errorTitle, ...errorRest] = displayError.split(': ');
    const errorDescription = errorRest.join(': ');
    return (
      <PageContainer title="エラー" titleColor="red.700">
        <Alert.Root status="error">
          <Alert.Indicator />
          <Box>
            <Alert.Title>{errorTitle}</Alert.Title>
            {errorDescription && <Alert.Description>{errorDescription}</Alert.Description>}
          </Box>
        </Alert.Root>
        <PageActions delay={0.1}>
          <Button onClick={handleGoHome}>戻る</Button>
        </PageActions>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="予約返却" titleColor="green.700" loading={loading}>
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
                      <Table.Cell>
                        {formatTimeToHHMM(data.startTime)} ～ {formatTimeToHHMM(data.endTime)}
                      </Table.Cell>
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
                  </Table.Body>
                </Table.Root>
              </Card.Body>
            </AnimatedCard>

            {/* 返却チェックリスト */}
            <AnimatedCard delay={0.15}>
              <Card.Header>
                <Heading size="lg">
                  <HStack>
                    <LuClipboardCheck />
                    <Text>返却チェックリスト</Text>
                  </HStack>
                </Heading>
              </Card.Header>
              <Card.Body>
                <VStack gap={4} align="stretch">
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    返却前に以下の項目を確認し、チェックしてください
                  </Text>

                  <VStack gap={3} align="stretch">
                    {/* チェック項目 */}
                    <Checkbox.Root
                      checked={checklist.roomCleaning}
                      onCheckedChange={() => handleChecklistChange('roomCleaning')}
                      size="md"
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Label>使用後の室内清掃は済みましたか。</Checkbox.Label>
                    </Checkbox.Root>

                    <Checkbox.Root
                      checked={checklist.lightsAndLock}
                      onCheckedChange={() => handleChecklistChange('lightsAndLock')}
                      size="md"
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Label>消灯、施錠は完全ですか。</Checkbox.Label>
                    </Checkbox.Root>

                    <Checkbox.Root
                      checked={checklist.fireCheck}
                      onCheckedChange={() => handleChecklistChange('fireCheck')}
                      size="md"
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Label>火気点検は済みましたか。</Checkbox.Label>
                    </Checkbox.Root>

                    <Checkbox.Root
                      checked={checklist.furnitureReset}
                      onCheckedChange={() => handleChecklistChange('furnitureReset')}
                      size="md"
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Label>机の配置や使用器具は元どおりですか。</Checkbox.Label>
                    </Checkbox.Root>

                    <VStack align="stretch" gap={2}>
                      <Checkbox.Root
                        checked={checklist.damageCheck}
                        onCheckedChange={() => handleChecklistChange('damageCheck')}
                        size="md"
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Label>施設や備品を破損させた箇所はありませんか。</Checkbox.Label>
                      </Checkbox.Root>

                      {/* 破損詳細入力欄 */}
                      <Box pl={6}>
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          破損させた箇所がある場合は、詳細を記入してください：
                        </Text>
                        <Textarea
                          value={damageDetails}
                          onChange={(e) => setDamageDetails(e.target.value)}
                          placeholder="破損箇所の詳細を記入してください（破損がない場合は空欄で結構です）"
                          size="sm"
                          rows={3}
                          resize="vertical"
                        />
                      </Box>
                    </VStack>
                  </VStack>

                  {/* チェックリスト完了状況 */}
                  {allChecklistCompleted ? (
                    <Alert.Root status="success">
                      <Alert.Indicator />
                      <Alert.Title>チェック完了</Alert.Title>
                      <Alert.Description>
                        全ての項目がチェックされました。画像をアップロードして返却処理を完了してください。
                      </Alert.Description>
                    </Alert.Root>
                  ) : (
                    <Alert.Root status="warning">
                      <Alert.Indicator />
                      <Alert.Title>チェック未完了</Alert.Title>
                      <Alert.Description>
                        すべての項目をチェックしてから返却処理を進めてください。
                      </Alert.Description>
                    </Alert.Root>
                  )}
                </VStack>
              </Card.Body>
            </AnimatedCard>

            {/* 画像アップロード */}
            <AnimatedCard delay={0.2}>
              <Card.Header>
                <Heading size="lg">
                  <HStack>
                    <LuImage />
                    <Text>返却画像</Text>
                  </HStack>
                </Heading>
              </Card.Header>
              <Card.Body>
                <VStack gap={4} align="stretch">
                  {/* ファイル選択 */}
                  <Box>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      display="none"
                    />

                    {selectedFiles.length === 0 ? (
                      <Box
                        border="2px dashed"
                        borderColor="gray.300"
                        borderRadius="md"
                        p={8}
                        textAlign="center"
                        cursor="pointer"
                        _hover={{ borderColor: 'blue.400', bg: 'gray.50' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <VStack gap={3}>
                          <LuUpload size="3rem" color="gray.400" />
                          <Text fontSize="lg" fontWeight="medium">
                            画像をアップロード (最大4枚)
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            クリックして画像を選択するか、ドラッグ&ドロップしてください
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            JPG, PNG, GIF (各最大10MB)
                          </Text>
                        </VStack>
                      </Box>
                    ) : (
                      <VStack gap={4}>
                        <HStack justifyContent="space-between" w="100%">
                          <Text fontWeight="medium">選択された画像 ({selectedFiles.length}/4)</Text>
                          {selectedFiles.length < 4 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              画像を追加
                            </Button>
                          )}
                        </HStack>
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="100%">
                          {previewUrls.map((url, index) => (
                            <Box key={index} position="relative">
                              <Image
                                src={url}
                                alt={`返却画像${index + 1}`}
                                maxH="200px"
                                w="100%"
                                objectFit="cover"
                                borderRadius="md"
                                border="1px solid"
                                borderColor="gray.200"
                              />
                              <Button
                                position="absolute"
                                top={2}
                                right={2}
                                size="sm"
                                colorScheme="red"
                                variant="solid"
                                onClick={() => handleFileRemove(index)}
                              >
                                <LuX />
                              </Button>
                              <Text mt={2} fontSize="xs" color="gray.600" textAlign="center">
                                {selectedFiles[index]?.name} (
                                {((selectedFiles[index]?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                              </Text>
                            </Box>
                          ))}
                        </SimpleGrid>
                      </VStack>
                    )}
                  </Box>

                  {/* 注意事項 */}
                  <Alert.Root status="info">
                    <Alert.Indicator />
                    <Box>
                      <Alert.Title>返却時の注意</Alert.Title>
                      <Alert.Description>
                        • 部屋全体がわかるように撮影してください
                        <br />
                        • 机や椅子が元の位置に戻っていることを確認してください
                        <br />• ゴミや忘れ物がないことを確認してください
                      </Alert.Description>
                    </Box>
                  </Alert.Root>

                  {displayError && (
                    <Alert.Root status="error">
                      <Alert.Indicator />
                      <Alert.Description>{displayError}</Alert.Description>
                    </Alert.Root>
                  )}
                </VStack>
              </Card.Body>
            </AnimatedCard>
          </>
        )}

        <PageActions delay={0.3}>
          <Button size="lg" variant="outline" onClick={handleGoHome} disabled={submitting}>
            予約ページに戻る
          </Button>
          <Button
            size="lg"
            colorScheme="green"
            onClick={handleReturn}
            loading={submitting}
            loadingText="返却中..."
            disabled={selectedFiles.length === 0 || !allChecklistCompleted}
          >
            返却する
          </Button>
        </PageActions>
      </VStack>
    </PageContainer>
  );
}
