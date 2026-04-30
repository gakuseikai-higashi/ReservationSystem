import { useNavigate } from 'react-router-dom';
import { VStack, Text, Button, Heading } from '@chakra-ui/react';
import { LuHouse, LuSearchX } from 'react-icons/lu';
import { useScrollToTop } from '@/shared/hooks/useScrollToTop';
import PageContainer from '@/shared/components/layout/PageContainer';
import AnimatedCard from '@/shared/components/ui/AnimatedCard';
import PageActions from '@/shared/components/ui/PageActions';

export default function NotFound() {
  const navigate = useNavigate();

  useScrollToTop();

  return (
    <PageContainer title="404" titleColor="red.500">
      <AnimatedCard delay={0.1}>
        <VStack gap={6} py={8} textAlign="center">
          <LuSearchX size="64px" color="var(--chakra-colors-red-400)" />
          <VStack gap={2}>
            <Heading size="xl" color="gray.700">
              ページが見つかりません
            </Heading>
            <Text color="gray.500" fontSize="md">
              お探しのページは存在しないか、移動された可能性があります。
            </Text>
          </VStack>
        </VStack>
      </AnimatedCard>

      <PageActions delay={0.2}>
        <Button size="lg" colorPalette="blue" onClick={() => navigate('/')}>
          <LuHouse />
          トップページに戻る
        </Button>
      </PageActions>
    </PageContainer>
  );
}
