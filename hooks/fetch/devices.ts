import { getDevices } from "@/controller/devicesController";
import { useDeviceStore } from "@/store/deviceStore";
import { useQuery } from "@tanstack/react-query";

// contains side effects
export function useDevices() {
    return useQuery({
        queryKey: ['devices'],
        queryFn: async () => {
            const data = await getDevices();

            const devicesArr = data?.devices || [];
            useDeviceStore.getState().setDevices(devicesArr);

            const thisDevice = devicesArr.find((device) => device.isThisDevice === true);
            if (thisDevice) useDeviceStore.getState().setThisTailscaleDevice(thisDevice);

            if (!data) return null;
            return data;
        },
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
    });
};