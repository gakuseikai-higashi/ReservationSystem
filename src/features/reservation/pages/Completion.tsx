import { useLocation, useNavigate } from 'react-router-dom';
import { Box, VStack, Card, Text, Button, Heading, Alert } from '@chakra-ui/react';
import { LuCheck, LuMail, LuX, LuPackage } from 'react-icons/lu';
import { useScrollToTop } from '@/shared/hooks/useScrollToTop';
import PageContainer from '@/shared/components/layout/PageContainer';
import AnimatedCard from '@/shared/components/ui/AnimatedCard';
import PageActions from '@/shared/components/ui/PageActions';

export default function Completion() {
  const location = useLocation();
  const navigate = useNavigate();

  // ページロード時にトップにスクロール
  useScrollToTop();

  const type = location.state?.type;

  const getDefaultMessage = () => {
    switch (type) {
      case 'cancel':
        return '予約キャンセルが完了しました';
      case 'return':
        return '予約返却が完了しました';
      case 'reserve':
      default:
        return '予約申請が完了しました';
    }
  };

  const message = location.state?.message || getDefaultMessage();

  const getIcon = () => {
    switch (type) {
      case 'cancel':
        return <LuX size="4rem" />;
      case 'return':
        return <LuPackage size="4rem" />;
      case 'reserve':
      default:
        return <LuCheck size="4rem" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'cancel':
        return 'red.500';
      case 'return':
        return 'blue.500';
      case 'reserve':
      default:
        return 'green.500';
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <PageContainer title="完了" titleColor={getColor()}>
      <VStack gap={6} align="stretch">
        {/* メインメッセージカード */}
        <AnimatedCard delay={0.1}>
          <Card.Body>
            <VStack gap={6} textAlign="center">
              <Box color={getColor()}>{getIcon()}</Box>
              <VStack gap={2}>
                <Heading size="xl" color={getColor()}>
                  {message}
                </Heading>
                {type === 'reserve' && (
                  <Text color="gray.600" fontSize="lg">
                    予約申請を受け付けました
                  </Text>
                )}
                {type === 'cancel' && (
                  <Text color="gray.600" fontSize="lg">
                    予約キャンセルが完了しました
                  </Text>
                )}
                {type === 'return' && (
                  <Text color="gray.600" fontSize="lg">
                    返却手続きが完了しました
                  </Text>
                )}
              </VStack>
            </VStack>
          </Card.Body>
        </AnimatedCard>

        {/* 詳細情報カード */}
        {type === 'reserve' && (
          <AnimatedCard delay={0.2}>
            <Card.Header>
              <Heading size="lg" color="blue.600">
                <Box display="inline-flex" alignItems="center" gap={2}>
                  <LuMail />
                  <Text>今後の流れ</Text>
                </Box>
              </Heading>
            </Card.Header>
            <Card.Body>
              <VStack gap={4} align="stretch">
                <Box p={4} bg="gray.50" borderRadius="md">
                  <VStack gap={2} align="stretch">
                    <VStack gap={1} align="stretch" pl={4}>
                      <Text fontSize="md">① 管理者による承認・確認</Text>
                      <Text fontSize="md">② 承認結果のメール通知</Text>
                      <Text fontSize="md">③ 予約確定</Text>
                    </VStack>
                  </VStack>
                </Box>

                <Alert.Root status="warning">
                  <Alert.Indicator />
                  <Box>
                    <Alert.Title>重要なお知らせ</Alert.Title>
                    <Alert.Description>
                      • 承認結果はメールでお知らせします
                      <br />
                      • キャンセルをご希望の場合は、承認結果メール内のキャンセルページからお手続きください
                      <br />
                      • 予約内容の変更をご希望の場合は、一度キャンセルのうえ改めてご申請ください
                      <br />
                      • ご不明な点がございましたら、管理者までお問い合わせください
                    </Alert.Description>
                  </Box>
                </Alert.Root>
              </VStack>
            </Card.Body>
          </AnimatedCard>
        )}

        {/* キャンセル完了案内 */}
        {type === 'cancel' && (
          <AnimatedCard delay={0.2}>
            <Card.Header>
              <Heading size="lg" color="red.600">
                <Box display="inline-flex" alignItems="center" gap={2}>
                  <LuX />
                  <Text>キャンセル完了</Text>
                </Box>
              </Heading>
            </Card.Header>
            <Card.Body>
              <VStack gap={4} align="stretch">
                <Alert.Root status="success">
                  <Alert.Indicator />
                  <Box>
                    <Alert.Title>予約キャンセルが完了しました</Alert.Title>
                    <Alert.Description>
                      ご指定の予約がキャンセルされました。
                      <br />
                      確認メールをお送りいたします。
                    </Alert.Description>
                  </Box>
                </Alert.Root>

                <Box p={4} bg="gray.50" borderRadius="md">
                  <VStack gap={2} align="stretch">
                    <Text fontWeight="bold" fontSize="sm">
                      キャンセル処理について：
                    </Text>
                    <VStack gap={1} align="stretch" pl={4}>
                      <Text fontSize="sm">✓ 予約がキャンセルされました</Text>
                      <Text fontSize="sm">✓ キャンセル確認メールを送信</Text>
                      <Text fontSize="sm">✓ 予約枠が解放されました</Text>
                    </VStack>
                  </VStack>
                </Box>

                <Alert.Root status="info">
                  <Alert.Indicator />
                  <Box>
                    <Alert.Title>再予約について</Alert.Title>
                    <Alert.Description>
                      別の日時での予約をご希望の場合は、
                      <br />
                      改めて予約フォームからお申し込みください。
                    </Alert.Description>
                  </Box>
                </Alert.Root>
              </VStack>
            </Card.Body>
          </AnimatedCard>
        )}

        {/* 返却完了案内 */}
        {type === 'return' && (
          <AnimatedCard delay={0.2}>
            <Card.Header>
              <Heading size="lg" color="blue.600">
                <Box display="inline-flex" alignItems="center" gap={2}>
                  <LuPackage />
                  <Text>返却完了</Text>
                </Box>
              </Heading>
            </Card.Header>
            <Card.Body>
              <VStack gap={4} align="stretch">
                <Alert.Root status="success">
                  <Alert.Indicator />
                  <Box>
                    <Alert.Title>返却手続きが完了しました</Alert.Title>
                    <Alert.Description>
                      返却画像とチェックリストの確認が完了しました。
                      <br />
                      ご利用ありがとうございました。
                    </Alert.Description>
                  </Box>
                </Alert.Root>

                <Box p={4} bg="gray.50" borderRadius="md">
                  <VStack gap={2} align="stretch">
                    <Text fontWeight="bold" fontSize="sm">
                      返却処理について：
                    </Text>
                    <VStack gap={1} align="stretch" pl={4}>
                      <Text fontSize="sm">✓ 返却画像を受付完了</Text>
                      <Text fontSize="sm">✓ チェックリスト確認完了</Text>
                      <Text fontSize="sm">✓ 管理者が最終確認を実施</Text>
                      <Text fontSize="sm">✓ 返却完了メールを送信</Text>
                    </VStack>
                  </VStack>
                </Box>

                <Alert.Root status="info">
                  <Alert.Indicator />
                  <Box>
                    <Alert.Title>今後について</Alert.Title>
                    <Alert.Description>
                      • 返却確認完了後、最終確認メールをお送りします
                      <br />
                      • ご不明な点がございましたら、管理者までお問い合わせください
                      <br />• またのご利用をお待ちしております
                    </Alert.Description>
                  </Box>
                </Alert.Root>
              </VStack>
            </Card.Body>
          </AnimatedCard>
        )}

        <PageActions delay={0.3}>
          <Button size="lg" colorScheme="blue" onClick={handleGoHome} px={8}>
            トップページに戻る
          </Button>
        </PageActions>
      </VStack>
    </PageContainer>
  );
}
