import { Button, ScrollView, View, YGroup, YStack } from 'tamagui';
import tsyncnativeModule from '@/modules/tsyncnative';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AppState, Platform } from 'react-native';
import {
  checkLocationAccess,
  LOCATION_ACCESS_DEFAULT_VALUE,
  LocationAccessResultType,
  locationAction,
} from '@/utils/locationAccessUtils';
import {
  ExternalLink,
  Key,
  MessageSquareDot,
  Navigation,
  Plug,
  SmartphoneCharging,
  X,
} from '@tamagui/lucide-icons';
import { checkNotificationAccess } from '@/utils/notification';
import { useZust } from '@/store/store';
import { updateBatteryStatus } from '@/controller/devicesController';
import { useDeviceStore } from '@/store/deviceStore';

const AppStatus = () => {
  const thisTailscaleDevice = useDeviceStore((d) => d.thisTailscaleDevice);

  const [isIgnoringBatteryOptimizations, setIsIgnoringBatteryOptimizations] =
    useState<boolean>(false);

  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);

  const updateBatteryState = () => {
    const res = tsyncnativeModule.isIgnoringBatteryOptimizations();
    setIsIgnoringBatteryOptimizations(res);
  };

  const updateNotifState = async () => {
    const res = await checkNotificationAccess(false);
    setNotificationPermission(res);
  };

  const updateStates = () => {
    updateBatteryState();
    updateNotifState();
  };

  useEffect(() => {
    const sub = AppState.addEventListener('change', (e) => {
      if (e === 'active') updateStates();
    });

    return () => {
      sub.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      updateStates();

      return () => {
        updateStates();
      };
    }, [])
  );

  const [locationAccess, setLocationAccess] = useState<LocationAccessResultType[]>(
    LOCATION_ACCESS_DEFAULT_VALUE
  );
  const isLocationAccessChecking = useRef<boolean>(false);
  useEffect(function checkLocationAccessOnInit() {
    async function check() {
      if (isLocationAccessChecking.current) return;

      isLocationAccessChecking.current = true;
      const res = await checkLocationAccess();
      setLocationAccess(res);
      // setCount((prev) => prev + 1);
      isLocationAccessChecking.current = false;
    }
    check();
    let listener = AppState.addEventListener('change', (e) => {
      if (e === 'active') check();
    });
    return () => {
      listener?.remove();
    };
  }, []);
  const haveLocationAccess = useMemo(() => {
    return {
      permission: locationAccess[0]?.access || false,
      service: locationAccess[1]?.access || false,
      precise: locationAccess[2]?.access || false,
    };
  }, [locationAccess]);

  const isAndroid = Platform.OS === 'android';

  return (
    <ScrollView flex={1} p={'$5'} bg={'$background'}>
      <YStack gap={'$4'}>
        {/* POWER */}
        <YGroup gap={'$0.5'}>
          {isAndroid ? (
            <Button
              justify="flex-start"
              icon={SmartphoneCharging}
              disabled={isIgnoringBatteryOptimizations}
              opacity={isIgnoringBatteryOptimizations ? 0.5 : 1}
              onPress={() => {
                const res = tsyncnativeModule.disableOptimizationsRoot();
                if (__DEV__) console.log('disableOptimizationsRoot', res);

                tsyncnativeModule.disableBatteryOptimizations();
              }}>
              Disable Battery Optimizations
            </Button>
          ) : null}
        </YGroup>

        {/* GPS */}
        <YGroup gap={'$0.5'}>
          <Button
            justify="flex-start"
            icon={Navigation}
            disabled={haveLocationAccess.permission}
            opacity={haveLocationAccess.permission ? 0.5 : 1}
            onPress={async () => {
              await locationAction(locationAccess);
            }}>
            Location: permission
          </Button>
          <Button
            justify="flex-start"
            icon={Navigation}
            disabled={haveLocationAccess.service}
            opacity={haveLocationAccess.service ? 0.5 : 1}
            onPress={async () => {
              await locationAction(locationAccess);
            }}>
            Location: service
          </Button>
          <Button
            justify="flex-start"
            icon={Navigation}
            disabled={haveLocationAccess.precise}
            opacity={haveLocationAccess.precise ? 0.5 : 1}
            onPress={async () => {
              await locationAction(locationAccess);
            }}>
            Location: precise
          </Button>
        </YGroup>

        {/* NOTIF */}
        <YGroup gap={'$0.5'}>
          <Button
            justify="flex-start"
            icon={MessageSquareDot}
            disabled={notificationPermission}
            opacity={notificationPermission ? 0.5 : 1}
            onPress={async () => {
              const res = await checkNotificationAccess(true);
              setNotificationPermission(res);
            }}>
            Notification Permission
          </Button>
        </YGroup>

        <View height={32} />

        {/*  */}
        <YGroup gap={'$0.5'}>
          <Button
            justify="flex-start"
            icon={ExternalLink}
            onPress={async () => {
              tsyncnativeModule.openTS();
            }}>
            Open Tailscale
          </Button>

          {isAndroid ? (
            <Button
              justify="flex-start"
              icon={ExternalLink}
              onPress={async () => {
                tsyncnativeModule.openTSRoot();
              }}>
              Open Tailscale (Root)
            </Button>
          ) : null}

          <Button
            justify="flex-start"
            icon={Plug}
            onPress={async () => {
              tsyncnativeModule.connectTS();
            }}>
            Connect Tailscale
          </Button>

          <Button
            justify="flex-start"
            icon={X}
            onPress={async () => {
              tsyncnativeModule.disconnectTS();
            }}>
            Disconnect Tailscale
          </Button>

          <Button
            justify="flex-start"
            icon={MessageSquareDot}
            onPress={async () => {
              tsyncnativeModule.startService();
            }}>
            Start Reconnection Service/Worker
          </Button>
        </YGroup>

        {/*  */}
        {isAndroid ? (
          <YGroup gap={'$0.5'}>
            <Button
              justify="flex-start"
              icon={Key}
              onPress={() => useZust.getState().updateIsRooted()}>
              Check isRooted (Root)
            </Button>

            {/* TODO: remove later */}
            <Button
              justify="flex-start"
              icon={Key}
              onPress={async () => {
                const res = await tsyncnativeModule.retrieveBatteryStatusRoot();

                const [l, p, t] = res.split(':');

                const level = Number(l);
                const isPlugged = p === 'true';
                const timestamp = Number(t);

                if (!thisTailscaleDevice?.id || isNaN(level) || isNaN(timestamp)) return;

                const result = await updateBatteryStatus(thisTailscaleDevice?.id, {
                  level,
                  isPlugged,
                  timestamp,
                });
              }}>
              retrieveBatteryStatusRoot (Root)
            </Button>
          </YGroup>
        ) : null}
      </YStack>

      <View height={180} />
    </ScrollView>
  );
};

export default AppStatus;
