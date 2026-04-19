import { SheetRegister, SheetDefinition } from 'react-native-actions-sheet';
import DeviceControlSheet from './Sheets/DeviceControlSheet';
import { DeviceListItem, TailscaleDevice } from '@/types/tailscale.interface';
import DomainChangeSheet from './Sheets/DomainChangeSheet';
import ShellDeviceSelectorSheet from './Sheets/ShellDeviceSelectorSheet';
import SetAdbDeviceIdentifierSheet from './Sheets/SetAdbDeviceIdentifierSheet';
import SetWindowsMacAddressSheet from './Sheets/SetWindowsMacAddressSheet';
import IgnoreBatteryOptimizationsSheet from './Sheets/IgnoreBatteryOptimizationsSheet';
import CronCreateSheet from './Sheets/CronCreateSheet';

declare module 'react-native-actions-sheet' {
  interface Sheets {
    'cron-create-sheet': SheetDefinition<{
      payload: {};
    }>;

    'device-control-sheet': SheetDefinition<{
      payload: {
        device: DeviceListItem;
      };
    }>;

    'domain-change-sheet': SheetDefinition<{
      payload: {};
    }>;

    'shell-device-selector-sheet': SheetDefinition<{
      payload: {
        onSelect: (device: TailscaleDevice) => void;
        selectedDeviceId: string | undefined;
      };
    }>;

    'set-adb-device-identifier-sheet': SheetDefinition<{
      payload: {
        selectedDeviceId: string;
        onSelect: (device: string | null) => void;
      };
    }>;

    'set-windows-mac-address-sheet': SheetDefinition<{
      payload: {
        selectedDeviceId: string;
        onSelect: (macAddress: string | null) => void;
      };
    }>;

    'ignore-battery-optimizations-sheet': SheetDefinition<{
      payload: {};
    }>;
  }
}

export const Sheets = () => {
  return (
    <SheetRegister
      sheets={{
        'cron-create-sheet': CronCreateSheet,
        'device-control-sheet': DeviceControlSheet,
        'domain-change-sheet': DomainChangeSheet,
        'shell-device-selector-sheet': ShellDeviceSelectorSheet,
        'set-adb-device-identifier-sheet': SetAdbDeviceIdentifierSheet,
        'set-windows-mac-address-sheet': SetWindowsMacAddressSheet,
        'ignore-battery-optimizations-sheet': IgnoreBatteryOptimizationsSheet,
      }}
    />
  );
};
