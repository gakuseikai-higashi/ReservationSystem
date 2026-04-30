import { useNavigate } from 'react-router-dom';
import { VStack, HStack, Card, Text, Button, Heading, Separator } from '@chakra-ui/react';
import { LuCalendarPlus, LuSearch, LuShield } from 'react-icons/lu';
import { useScrollToTop } from '@/shared/hooks/useScrollToTop';
import PageContainer from '@/shared/components/layout/PageContainer';
import AnimatedCard from '@/shared/components/ui/AnimatedCard';
import PageActions from '@/shared/components/ui/PageActions';

export default function Home() {
  const navigate = useNavigate();

  // ページロード時にトップにスクロール
  useScrollToTop();

  const handleMakeReservation = () => {
    navigate('/reserve');
  };

  const handleGoToAdmin = () => {
    navigate('/admin');
  };

  return (
    <PageContainer title="兵庫県立大学商科キャンパス 部室棟予約システム" titleColor="blue.600">
      <VStack gap={8} align="stretch">
        {/* メインアクション */}
        <AnimatedCard delay={0.1}>
          <Card.Header>
            <Heading size="xl" textAlign="center" color="blue.700">
              <HStack justify="center">
                <LuCalendarPlus />
                <Text>予約を開始</Text>
              </HStack>
            </Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} textAlign="center">
              <Text color="gray.600" fontSize="lg">
                ミーティングルームのご予約はこちらから
              </Text>
              <Text color="blue.600" fontSize="sm">
                予約の確定時に使用事項とガイドラインの確認をお願いします
              </Text>
              <Button size="xl" colorScheme="blue" px={12} py={6} onClick={handleMakeReservation}>
                新規予約
              </Button>
            </VStack>
          </Card.Body>
        </AnimatedCard>

        {/* 利用案内 */}
        <AnimatedCard delay={0.4}>
          <Card.Header>
            <Heading size="lg">
              <HStack>
                <LuSearch />
                <Text>ご利用案内</Text>
              </HStack>
            </Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap={3} align="stretch">
              <Text fontSize="md" fontWeight="semibold">
                利用時間
              </Text>
              <Text fontSize="sm" color="gray.600" pl={4}>
                • 9:00〜20:00
              </Text>

              <Text fontSize="md" fontWeight="semibold" mt={4}>
                利用ルール
              </Text>
              <Text fontSize="sm" color="gray.600" pl={4}>
                • キャンセルは使用日の3日前までにお願いします
                <br />
                • 利用後は必ず清掃・整理整頓をお願いします
                <br />
                • 利用終了時には部屋の状況を撮影し、返却時にアップロードしてください
              </Text>

              <Text fontSize="md" fontWeight="semibold" mt={4}>
                予約可能期間
              </Text>
              <Text fontSize="sm" color="gray.600" pl={4}>
                • 利用日の2週間前〜1ヶ月前の間に予約できます
              </Text>
            </VStack>
          </Card.Body>
        </AnimatedCard>

        <PageActions delay={0.5}>
          <Separator mb={4} />
          <VStack gap={2}>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              管理者の方はこちら
            </Text>
            <Button size="sm" variant="ghost" colorScheme="gray" onClick={handleGoToAdmin}>
              <HStack>
                <LuShield />
                <Text>管理画面</Text>
              </HStack>
            </Button>
          </VStack>
        </PageActions>
      </VStack>
    </PageContainer>
  );
}
