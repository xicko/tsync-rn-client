import { useNotificationsSyncList } from '@/hooks/fetch/notifications-sync';
import { eventEmit } from '@/utils/eventEmit';
import { Filter, X } from '@tamagui/lucide-icons';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Platform, RefreshControl } from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';
import { View, ScrollView, YGroup, Button, Text, YStack, Spinner, XStack } from 'tamagui';
import { useNotificationsSyncListFilterStore } from '@/store/notificationsSyncListFilterStore';

import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const NotificationsScreen = () => {
  const isWeb = Platform.OS === 'web';
  const now = dayjs();
  const activeFilters = useNotificationsSyncListFilterStore((state) => state.activeFilters);
  const setActiveFilters = useNotificationsSyncListFilterStore((state) => state.setActiveFilters);
  const resetFilters = useNotificationsSyncListFilterStore((state) => state.resetFilters);

  const hasActiveFilters = activeFilters.search !== '' || activeFilters.os !== 'all' || activeFilters.startDate !== null || activeFilters.endDate !== null;

  const {
    data: globalNotifications,
    refetch: refetchNotificationsSync,
    fetchNextPage: fetchNextPageNotificationsSync,
    hasNextPage: hasNextPageNotificationsSync,
    isFetchingNextPage: isFetchingNextPageNotificationsSync,
    isRefetching: isRefetchingNotificationsSync,
  } = useNotificationsSyncList(activeFilters);
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
    if (isCloseToBottom && hasNextPageNotificationsSync && !isFetchingNextPageNotificationsSync) fetchNextPageNotificationsSync();
  };

  const onRefresh = () => {
    refetchNotificationsSync();
  };

  useEffect(() => {
    const callback = () => onRefresh();
    eventEmit.on('refreshNotificationsSyncList', callback);
    return () => {
      eventEmit.off('refreshNotificationsSyncList', callback);
    }
  }, []);

  return (
    <View flex={1} bg="$background">
      <View flex={1} z={0} overflow='hidden'>
        {hasActiveFilters ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              flexGrow: 0,
            }}
          >
            <XStack
              px="$3"
              py="$2.5"
              gap="$2.5"
              items="center"
            >
              {activeFilters.search !== '' ? (
                <XStack
                  bg="$color5"
                  px="$2.5"
                  py="$1.5"
                  rounded={8}
                  items="center"
                  gap="$2"
                >
                  <Text fontSize="$3" color="$color">
                    {'Search: "' + activeFilters.search + '"'}
                  </Text>
                  <Button
                    size="$1.5"
                    icon={X}
                    bg={'transparent'}
                    onPress={() => setActiveFilters({ ...activeFilters, search: '' })}
                  />
                </XStack>
              ) : null}

              {activeFilters.os !== 'all' ? (
                <XStack
                  bg="$color5"
                  px="$2.5"
                  py="$1.5"
                  rounded={8}
                  items="center"
                  gap="$2"
                >
                  <Text fontSize="$3" color="$color" textTransform="capitalize">
                    OS: {activeFilters.os.toUpperCase()}
                  </Text>
                  <Button
                    size="$1.5"
                    icon={X}
                    bg={'transparent'}
                    onPress={() => setActiveFilters({ ...activeFilters, os: 'all' })}
                  />
                </XStack>
              ) : null}

              {activeFilters.startDate !== null ? (
                <XStack
                  bg="$color5"
                  px="$2.5"
                  py="$1.5"
                  rounded={8}
                  items="center"
                  gap="$2"
                >
                  <Text fontSize="$3" color="$color">
                    After: {dayjs(activeFilters.startDate).format('MM/DD/YYYY')}
                  </Text>
                  <Button
                    size="$1.5"
                    icon={X}
                    bg={'transparent'}
                    onPress={() => setActiveFilters({ ...activeFilters, startDate: null })}
                  />
                </XStack>
              ) : null}

              {activeFilters.endDate !== null ? (
                <XStack
                  bg="$color5"
                  px="$2.5"
                  py="$1.5"
                  rounded={8}
                  items="center"
                  gap="$2"
                >
                  <Text fontSize="$3" color="$color">
                    Before: {dayjs(activeFilters.endDate).format('MM/DD/YYYY')}
                  </Text>
                  <Button
                    size="$1.5"
                    icon={X}
                    bg={'transparent'}
                    onPress={() => setActiveFilters({ ...activeFilters, endDate: null })}
                  />
                </XStack>
              ) : null}

              <Button
                size="$2"
                chromeless
                color="$red10"
                onPress={resetFilters}
              >
                Clear All
              </Button>
            </XStack>
          </ScrollView>
        ) : null}

        <ScrollView
          onScroll={onScroll}
          refreshControl={<RefreshControl
            refreshing={isRefetchingNotificationsSync}
            onRefresh={onRefresh}
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
                const isFirst = i === 0;
                const isLast = i === globalNotifs.length - 1;
                const timestamp = dayjs(notif.android.timestamp);
                let format = 'MM/DD - HH:mm:ss';
                if (timestamp.year() !== now.year()) format = 'YYYY/MM/DD - HH:mm:ss';
                return (
                  <Button
                    key={notif._id}
                    height={'auto'}
                    py="$2.5"
                    width={'100%'}
                    style={{
                      borderTopLeftRadius: isFirst ? 8 : 0,
                      borderTopRightRadius: isFirst ? 8 : 0,
                      borderBottomLeftRadius: isLast ? 8 : 0,
                      borderBottomRightRadius: isLast ? 8 : 0,
                    }}
                  >
                    <YStack width={'100%'} items='flex-start'>
                      <Text fontSize={'$4'} fontWeight={600} style={{ textAlign: 'left' }}>
                        {notif.android.title}
                      </Text>

                      {notif.android.text ? (
                        <Text fontSize={'$4'} fontWeight={500} style={{ textAlign: 'left' }}>
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
                        {timestamp.format(format)} ({timestamp.fromNow()})
                      </Text>
                    </YStack>
                  </Button>
                );
              });
            })()}

            {isFetchingNextPageNotificationsSync ? (
              <View height={160} width={'100%'} justify='center' items='center'>
                <Spinner size={'large'} color='$color10' />
              </View>
            ) : <View height={160} />}
          </YGroup>
        </ScrollView>
      </View>

      <YGroup
        position='absolute'
        r={24}
        b={24}
      >
        <Button
          themeInverse
          aspectRatio={1}
          icon={<Filter scale={isWeb ? 2 : undefined} />}
          onPress={(e) => {
            e.stopPropagation();
            SheetManager.show('notifications-sync-list-filter-sheet');
          }}
        />
      </YGroup>
    </View>
  );
};

export default NotificationsScreen;
