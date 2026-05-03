import { useLocalNotifications } from '@/hooks/local/notifications';
import { storage } from '@/utils/storage';
import { Globe, Settings2, Smartphone } from '@tamagui/lucide-icons';
import dayjs from 'dayjs';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { View, ScrollView, YGroup, Button, Text, YStack, XStack } from 'tamagui';

const NotificationsScreen = () => {
  const [selectedTab, setSelectedTab] = useState<'global' | 'local'>('global');

  const { data: localNotifications, refetch: refetchLocalNotifications } = useLocalNotifications();
  const localNotifs = useMemo(() => {
    return (localNotifications || []).filter(Boolean).sort((a, b) => {
      return b.timestamp - a.timestamp;
    });
  }, [localNotifications]);

  useFocusEffect(
    useCallback(() => {
      refetchLocalNotifications();
    }, [])
  );

  return (
    <View flex={1} bg="$background">
      <XStack gap="$0">
        <Button
          flex={1}
          bg={selectedTab !== 'global' ? 'transparent' : undefined}
          rounded={0}
          icon={Globe}
          onPress={() => setSelectedTab('global')}>
          <Text>Global</Text>
        </Button>
        <Button
          flex={1}
          bg={selectedTab !== 'local' ? 'transparent' : undefined}
          rounded={0}
          icon={Smartphone}
          onPress={() => setSelectedTab('local')}>
          <Text>Local</Text>
        </Button>
      </XStack>

      {/* Global */}
      {selectedTab === 'global' ? <Text>TODO</Text> : null}

      {/* Local */}
      {selectedTab === 'local' && Platform.OS === 'android' ? (
        <View flex={1}>
          <ScrollView
            style={{
              flexGrow: 0,
            }}>
            <YGroup m={'$3'} gap="$0.5">
              {localNotifs.map((notif, i) => {
                return (
                  <Button key={notif.timestamp} height={'auto'} py="$2.5" width={'100%'}>
                    <YStack width={'100%'}>
                      <Text fontSize={'$4'} fontWeight={600}>
                        {notif.title}
                      </Text>
                      {notif.text ? (
                        <Text fontSize={'$4'} fontWeight={600}>
                          {notif.text || 'No text.'}
                        </Text>
                      ) : null}
                      <Text color="$color8">{notif.packageName}</Text>
                      <Text color="$color8">
                        {dayjs(notif.timestamp).format('YYYY/MM/DD - HH:mm:ss')}
                      </Text>
                    </YStack>
                  </Button>
                );
              })}
            </YGroup>
          </ScrollView>

          {/* TODO */}
          <Button
            position="absolute"
            b={24}
            r={24}
            themeInverse
            icon={Settings2}
            aspectRatio={1}
            onPress={() => {
              storage.delete('local_notifications');
            }}
          />
        </View>
      ) : null}
    </View>
  );
};

export default NotificationsScreen;
