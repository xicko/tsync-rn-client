import { useNotificationsSyncList } from '@/hooks/fetch/notifications-sync';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, RefreshControl } from 'react-native';
import { View, ScrollView, YGroup, Button, Text, YStack } from 'tamagui';

const NotificationsScreen = () => {
  const {
    data: globalNotifications,
    refetch: refetchNotificationsSync,
    hasNextPage: hasNextPageNotificationsSync,
    isFetchingNextPage: isFetchingNextPageNotificationsSync,
    isRefetching: isRefetchingNotificationsSync,
  } = useNotificationsSyncList();
  const globalNotifs = useMemo(() => {
    const flattened = globalNotifications?.pages?.flatMap(page => page?.data || []) || [];
    return flattened.map((a) => ({
      ...a,
      tailscaleDevice: a.tailscaleDevice,
    }));
  }, [globalNotifications]);  
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    if (isCloseToBottom && hasNextPageNotificationsSync && !isFetchingNextPageNotificationsSync) refetchNotificationsSync();
  };

  return (
    <View flex={1} bg="$background">
      <View flex={1} z={0} overflow='hidden'>
        <ScrollView
          onScroll={onScroll}
          refreshControl={<RefreshControl
            refreshing={isRefetchingNotificationsSync}
            onRefresh={() => {
              refetchNotificationsSync();
            }}
          />}
          style={{
            flexGrow: 0,
          }}
        >
          <YGroup m={'$3'} gap="$0.5">
            {(() => {
              if (globalNotifs.length === 0) {
                return <View justify="center" items='center' py='$8'>
                  <Text color='$color9'>
                    No notifications.
                  </Text>
                </View>;
              }

              return globalNotifs.map((notif, i) => {
                return (
                  <Button
                    key={notif._id}
                    height={'auto'}
                    py="$2.5"
                    width={'100%'}>
                    <YStack width={'100%'}>
                      <Text fontSize={'$4'} fontWeight={600}>
                        {notif.android.title}
                      </Text>

                      {notif.android.text ? (
                        <Text fontSize={'$4'} fontWeight={600}>
                          {notif.android.text || 'No text.'}
                        </Text>
                      ) : null}

                      {notif.tailscaleDevice?.name ? (
                        <Text color="$color8">
                          {notif?.tailscaleDevice?.name?.split('.')[0] || ''}
                          </Text>
                      ) : null}

                      <Text color="$color8">{notif.android.packageName}</Text>

                      <Text color="$color8">
                        {dayjs(notif.android.timestamp).format('YYYY/MM/DD - HH:mm:ss')}
                      </Text>
                    </YStack>
                  </Button>
                );
              });
            })()}
          </YGroup>
        </ScrollView>
      </View>
    </View>
  );
};

export default NotificationsScreen;
