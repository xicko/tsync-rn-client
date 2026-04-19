import { useThemeStore } from '@/store/themeStore';
import {} from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';
import { Button, Text, View, YGroup } from 'tamagui';

const SettingsScreen = () => {
  const { theme, setTheme } = useThemeStore();
  return (
    <View flex={1} bg="$background" p="$5">
      <YGroup gap="$0.5">
        <Button onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          <Text>Toggle Theme</Text>
        </Button>

        <Button onPress={() => SheetManager.show('domain-change-sheet')}>
          <Text>Change Domain</Text>
        </Button>
      </YGroup>
    </View>
  );
};

export default SettingsScreen;
