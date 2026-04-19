import { Redirect, useRootNavigationState } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useThemeStore } from '@/store/themeStore';

const Index = () => {
  const rootNavigationState = useRootNavigationState();
  const theme = useThemeStore((state) => state.theme);

  const [wait, setWait] = useState<boolean>(true);
  useEffect(() => {
    (async () => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setWait(false);
    })();
  }, []);

  if (!rootNavigationState?.key || wait) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme === 'light' ? '#fff' : '#000',
        }}>
        <ActivityIndicator color={theme === 'light' ? '#000' : '#fff'} size="large" />
      </View>
    );
  }

  return <Redirect href="/tabs/devices" />;
};

export default Index;
