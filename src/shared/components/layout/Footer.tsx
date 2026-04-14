import { Box, Text, VStack, HStack, Separator } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

export default function Footer() {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      w="full"
      pt={{ base: 4, md: 6 }}
    >
      <Separator borderColor="gray.300" mb={{ base: 3, md: 4 }} />
      <VStack gap={{ base: 2, md: 3 }} textAlign="center">
        <HStack justify="center" gap={2}>
          <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600">
            開発・運営：
          </Text>
          <Text fontSize={{ base: 'xs', md: 'sm' }} color="blue.600" fontWeight="semibold">
            兵庫県立大学 データ分析研究部
          </Text>
        </HStack>
        <Text fontSize="xs" color="gray.500">
          兵庫県立大学商科キャンパス 部室棟予約システム &copy;2026
        </Text>
        <Text fontSize="xs" color="gray.400">
          お問い合わせやシステムの不具合がございましたら、管理者までご連絡ください
        </Text>
      </VStack>
    </MotionBox>
  );
}
