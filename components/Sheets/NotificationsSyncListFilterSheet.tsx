import { Button, Input, Separator, Text, View, XStack, useTheme } from 'tamagui';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import { DEFAULT_FILTERS_NOTIFICATIONS_SYNC, NotificationsSyncListActiveFiltersType, useNotificationsSyncListFilterStore } from '@/store/notificationsSyncListFilterStore';
import { useState } from 'react';
import { Check } from '@tamagui/lucide-icons';
import dayjs from 'dayjs';

const NotificationsSyncListFilterSheet: React.FC<SheetProps<'notifications-sync-list-filter-sheet'>> = ({ sheetId, payload }) => {
  const tamaguiTheme = useTheme();
  const activeFilters = useNotificationsSyncListFilterStore((state) => state.activeFilters);
  
  const [localFilters, setLocalFilters] = useState<NotificationsSyncListActiveFiltersType>(activeFilters);

  return (
    <ActionSheet
      id={sheetId}
      gestureEnabled
      containerStyle={{ backgroundColor: tamaguiTheme.background.val }}>
      <View p="$5" gap="$3">
        <Text fontSize="$4" fontWeight="300" color="$color9">
          Search
        </Text>

        <Input
          value={localFilters.search}
          onChangeText={(text) => setLocalFilters({ ...localFilters, search: text })}
          placeholder="Search..."
        />

        <Text fontSize="$4" fontWeight="300" color="$color9" mt="$2">
          OS Platform
        </Text>

        <XStack gap='$3' flexWrap='wrap'>
          {(['all', 'android', 'ios', 'windows', 'linux', 'macos'] as const).map((os) => (
            <Button
              key={os}
              size={'$3'}
              themeInverse={localFilters.os === os}
              {...localFilters.os === os ? {
                icon: Check,
              } : {}}
              onPress={() => setLocalFilters((prev) => ({ ...prev, os }))}
            >
              <Text textTransform="capitalize">
                {os.toUpperCase()}
              </Text>
            </Button>
          ))}
        </XStack>

        <Text fontSize="$4" fontWeight="300" color="$color9" mt="$2">
          Time Range
        </Text>

        <XStack gap='$3' flexWrap='wrap'>
          {(['any', 'today', 'yesterday', 'week'] as const).map((range) => {
            const isSelected = (() => {
              if (range === 'any') return localFilters.startDate === null && localFilters.endDate === null;
              if (range === 'today') {
                const todayStart = dayjs().startOf('day').valueOf();
                return localFilters.startDate === todayStart;
              }
              if (range === 'yesterday') {
                const yesterdayStart = dayjs().subtract(1, 'day').startOf('day').valueOf();
                return localFilters.startDate === yesterdayStart;
              }
              if (range === 'week') {
                const weekStart = dayjs().subtract(7, 'day').startOf('day').valueOf();
                return localFilters.startDate === weekStart;
              }
              return false;
            })();

            const label = {
              any: 'Any Time',
              today: 'Today',
              yesterday: 'Yesterday',
              week: 'Past 7 Days',
            }[range];

            return (
              <Button
                key={range}
                size={'$3'}
                themeInverse={isSelected}
                {...isSelected ? { icon: Check } : {}}
                onPress={() => {
                  if (range === 'any') {
                    setLocalFilters((prev) => ({ ...prev, startDate: null, endDate: null }));
                  } else if (range === 'today') {
                    setLocalFilters((prev) => ({
                      ...prev,
                      startDate: dayjs().startOf('day').valueOf(),
                      endDate: dayjs().endOf('day').valueOf(),
                    }));
                  } else if (range === 'yesterday') {
                    setLocalFilters((prev) => ({
                      ...prev,
                      startDate: dayjs().subtract(1, 'day').startOf('day').valueOf(),
                      endDate: dayjs().subtract(1, 'day').endOf('day').valueOf(),
                    }));
                  } else if (range === 'week') {
                    setLocalFilters((prev) => ({
                      ...prev,
                      startDate: dayjs().subtract(7, 'day').startOf('day').valueOf(),
                      endDate: dayjs().endOf('day').valueOf(),
                    }));
                  }
                }}
              >
                <Text>
                  {label}
                </Text>
              </Button>
            );
          })}
        </XStack>

        <Separator my='$2' />

        <XStack
          gap='$3'
        >
          <Button
            onPress={() => {
              setLocalFilters(DEFAULT_FILTERS_NOTIFICATIONS_SYNC);
            }}
          >
            <Text>
              Reset
            </Text>
          </Button>

          <Button
            flex={1}
            icon={Check}
            onPress={() => {
              useNotificationsSyncListFilterStore.getState().setActiveFilters(localFilters);
              SheetManager.hide(sheetId);
            }}
          >
            <Text>
              Apply
            </Text>
          </Button>
        </XStack>
      </View>
    </ActionSheet>
  );
};

export default NotificationsSyncListFilterSheet;
