import { Box, Text, Icon, useColorModeValue, Flex } from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';

const ModernWarningCard = () => {
  const bgColor = useColorModeValue('red.50', 'red.900');
  const textColor = useColorModeValue('red.800', 'red.100');
  
  return (
    <Flex
      direction="row"
      alignItems="center"
      justifyContent="start"
      p={4}
      m={2}
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      fontSize="smaller"
      borderColor="red.400"
      boxShadow="sm"
      width="60%"
    >
      <Icon as={WarningTwoIcon} w={4} h={4} color="red.500" mr={3} />
      <Text fontSize="sm" color={textColor}>
        No liquidity for LINK-USDC or LINK-DAI pools. Please check again later.
      </Text>
    </Flex>
  );
};

export default ModernWarningCard;
