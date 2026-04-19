import { useZust } from '@/store/store';
import { RotateCcw } from '@tamagui/lucide-icons';
import { useState } from 'react';
import ActionSheet, { SheetProps } from 'react-native-actions-sheet';
import { Button, Input, XGroup, YStack, Text, useTheme } from 'tamagui';
import { domain } from '@/constants/domain';
import { showToast } from '@/utils/toast';
import { Platform } from 'react-native';

const DomainChangeSheet: React.FC<SheetProps<'domain-change-sheet'>> = ({ sheetId }) => {
  const { domainAddress, setDomainAddress } = useZust();
  const theme = useTheme();

  const [input, setInput] = useState<string>('');

  const changeDomain = async (val: string) => {
    const need = ['http', ':', '.'];
    if (val.includes(need[0]) && val.includes(need[1]) && val.includes(need[2])) {
      showToast({
        text1: 'Changing domain...',
      });
      setDomainAddress(val);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      // await ExpoUpdates.reloadAsync();
      if (Platform.OS === 'android') {
        const tsyncnativeModule = (await import('@/modules/tsyncnative')).default;
        tsyncnativeModule.reloadApp();
      } else if (Platform.OS === 'web') {
        window.location.reload();
      }
    }
  };

  return (
    <ActionSheet
      id={sheetId}
      gestureEnabled
      snapPoints={[100]}
      containerStyle={{ backgroundColor: theme.background.val }}>
      <YStack p={'$5'} gap={'$4'}>
        <Text>Current: {domainAddress}</Text>

        <Input
          value={input}
          onChangeText={setInput}
          autoCorrect={false}
          autoComplete="off"
          autoCapitalize="none"
        />

        <XGroup gap={'$0.5'}>
          <Button
            aspectRatio={1}
            themeInverse
            icon={RotateCcw}
            onPress={() => changeDomain(domain)}
          />

          <Button flex={1} themeInverse onPress={() => changeDomain(input)}>
            Save
          </Button>
        </XGroup>
      </YStack>
    </ActionSheet>
  );
};

export default DomainChangeSheet;
