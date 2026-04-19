import { DeviceListItem, TailscaleDevice } from '@/types/tailscale.interface';
import { create } from 'zustand';

interface DeviceStoreState {
  devices: TailscaleDevice[];
  setDevices: (devices: TailscaleDevice[]) => void;

  selectedDevice: DeviceListItem | null;
  setSelectedDevice: (device: DeviceListItem) => void;
  clearSelectedDevice: () => void;

  lastDeviceUpdate: Date | null;
  setLastDeviceUpdate: (date: Date) => void;

  thisTailscaleDevice: TailscaleDevice | null;
  setThisTailscaleDevice: (device: TailscaleDevice) => void;
}

export const useDeviceStore = create<DeviceStoreState>((set) => ({
  devices: [],
  setDevices: (devices) => set({ devices }),

  selectedDevice: null,
  setSelectedDevice: (device) => set({ selectedDevice: device }),
  clearSelectedDevice: () => set({ selectedDevice: null }),

  lastDeviceUpdate: null,
  setLastDeviceUpdate: (date) => set({ lastDeviceUpdate: date }),

  thisTailscaleDevice: null,
  setThisTailscaleDevice: (device) => set({ thisTailscaleDevice: device }),
}));
