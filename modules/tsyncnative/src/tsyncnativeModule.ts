import { NativeModule, requireNativeModule } from 'expo';

import { tsyncnativeModuleEvents } from './tsyncnative.types';

declare class tsyncnativeModule extends NativeModule<tsyncnativeModuleEvents> {
  reloadApp(): Promise<void>;

  isIgnoringBatteryOptimizations(): boolean;
  disableBatteryOptimizations(packageName?: string): void;

  openTS(): void;
  connectTS(): void;
  disconnectTS(): void;
  startService(): void;

  isRooted(): boolean;
  openTSRoot(): void;

  disableOptimizationsRoot(packageName?: string): boolean;
  blockNotificationsRoot(packageName?: string): boolean;
  retrieveBatteryStatusRoot(): Promise<string>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<tsyncnativeModule>('tsyncnative');
