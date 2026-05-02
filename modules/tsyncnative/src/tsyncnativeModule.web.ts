import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './tsyncnative.types';

type tsyncnativeModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class tsyncnativeModule extends NativeModule<tsyncnativeModuleEvents> {
  reloadApp() {
    window.location.reload();
  };

  isIgnoringBatteryOptimizations() {};
  disableBatteryOptimizations() {};

  openTS(): void {};
  connectTS(): void {};
  disconnectTS(): void {};
  
  startConnectionWorker(): void {};
  startBatteryWorker(): void {};

  isRooted(): boolean { return false; };
  openTSRoot(): void {};

  disableOptimizationsRoot(packageName?: string): boolean { return false; };
  blockNotificationsRoot(packageName?: string): boolean { return false; };
  retrieveBatteryStatus(): void {};
};

export default registerWebModule(tsyncnativeModule, 'tsyncnativeModule');
