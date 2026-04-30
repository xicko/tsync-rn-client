import { Button, H6, Text, useTheme, View, XStack, YGroup, Input, XGroup } from 'tamagui';
import ActionSheet, { ScrollView, SheetManager, SheetProps } from 'react-native-actions-sheet';
import { useAdbDevices } from '@/hooks/fetch/adb.devices';
import { Check, HelpCircle, Plug, Wifi, X } from '@tamagui/lucide-icons';
import { useDeviceStore } from '@/store/deviceStore';
import { useMemo, useState } from 'react';

const SetAdbDeviceIdentifierSheet: React.FC<SheetProps<'set-adb-device-identifier-sheet'>> = ({
  sheetId,
  payload,
}) => {
  const deviceId = payload?.selectedDeviceId!;
  const theme = useTheme();

  const [input, setInput] = useState<string>('');

  const { data: devices } = useAdbDevices();

  const { devices: tailscaleDevices } = useDeviceStore();

  const thisDevice = useMemo(() => {
    return tailscaleDevices.find((d) => d.id === deviceId);
  }, [tailscaleDevices, deviceId]);

  return (
    <ActionSheet
      id={sheetId}
      gestureEnabled
      containerStyle={{ backgroundColor: theme.background.val }}>
      <View p={'$4'} gap={'$3'}>
        <View>
          <H6>Set adb device identifier</H6>
        </View>

        <XStack width={'100%'} gap="$3">
          <Input
            flex={1}
            placeholder="ADB Port"
            keyboardType="numeric"
            value={input}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '');
              setInput(cleaned);
            }}
          />

          <Button
            height={'auto'}
            icon={Check}
            onPress={() => {
              if (!input) return;
              // IP Address is inferred automatically
              payload?.onSelect(`:${input}`);
            }}
          />
        </XStack>

        <ScrollView style={{ maxHeight: 400, borderRadius: 8, overflow: 'hidden' }}>
          <YGroup gap={'$0.5'}>
            {(devices || [])?.map((device) => (
              <Button
                key={device}
                height="auto"
                py={'$3'}
                // themeInverse
                icon={!device.includes(':') ? Plug : Wifi}
                onPress={() => {
                  payload?.onSelect(device);
                  SheetManager.hide(sheetId);
                }}>
                <XStack justify={'space-between'} flex={1} items="center">
                  <Text>{device}</Text>

                  {/* Recommended / likely */}
                  {thisDevice &&
                    thisDevice.addresses.some((address) => device.includes(address)) && (
                      <HelpCircle strokeWidth={1.2} size={20} />
                    )}
                </XStack>
              </Button>
            ))}
            <Button
              height="auto"
              py={'$3'}
              justify="flex-start"
              icon={<X size={20} />}
              onPress={() => {
                payload?.onSelect(null);
                SheetManager.hide(sheetId);
              }}>
              <Text>None</Text>
            </Button>
          </YGroup>
        </ScrollView>
      </View>
    </ActionSheet>
  );
};

export default SetAdbDeviceIdentifierSheet;
