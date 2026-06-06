import { TailscaleDevice } from '@/types/tailscale.interface';

export interface MessageType {
  id: string;
  message: string;
  timestamp: number;
  tailscaleDeviceData: Partial<TailscaleDevice>;
}
