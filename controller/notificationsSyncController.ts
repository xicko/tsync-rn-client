import { useZust } from "@/store/store";
import { CollectedNotification } from "@/types/notifications.interface";
import { PaginationResponse } from "@/types/pagination.interface";
import { TailscaleDevice } from "@/types/tailscale.interface";

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

interface DataType extends CollectedNotification {
    _id: string;
    tailscaleDevice?: TailscaleDevice;
    timestamp: number;
};
export interface NotificationsSyncListResponseType {
    success: boolean,
    pagination?: {
        total: number;
        limit: number;
        hasNext: boolean;
        hasPrev?: boolean;
        page?: number;
        timestamp?: number;
        lastItemTimestamp?: number;
    },
    data?: DataType[];
};
export async function getNotificationsList(pagination: { limit?: number, page?: number, timestamp?: number }): Promise<NotificationsSyncListResponseType | null> {
    const url = useZust.getState().domainAddress;
    const domain = new URL(`${url}/api/notifications-sync/list`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    if (pagination.page) domain.searchParams.append('page', String(pagination.page));
    if (pagination.timestamp) domain.searchParams.append('timestamp', String(pagination.timestamp));
    if (pagination.limit) domain.searchParams.append('limit', String(pagination.limit));
    
    try {
        const response = await fetch(domain, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
        });
        
        const data = await response.json();
        
        clearTimeout(timeoutId);

        return data;
    } catch (error) {
        if (error instanceof Error && __DEV__) console.log(error.message);
        return null;
    } finally {
        clearTimeout(timeoutId);
    }
}