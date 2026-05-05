import { useZust } from "@/store/store";
import { CollectedNotification } from "@/types/notifications.interface";

export async function receiveNotification(tailscaleId: string, body: CollectedNotification): Promise<boolean> {
    const domain = useZust.getState().domainAddress;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
        const response = await fetch(`${domain}/api/notifications-sync/devices/${tailscaleId}/receive-notification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        
        const data = await response.json() as { success: boolean };
        clearTimeout(timeoutId);
        return data.success;
    } catch (error) {
        if (error instanceof Error && __DEV__) console.log(error.message);
        return false;
    } finally {
        clearTimeout(timeoutId);
    }
}