import { useZust } from "@/store/store";
import { CollectedNotification } from "@/types/notifications.interface";
import { TailscaleDevice } from "@/types/tailscale.interface";
import dayjs from "dayjs";

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

export interface GetNotificationsListOptions {
    limit?: number;
    page?: number;
    timestamp?: number;
    search?: string;
    os?: string;
    startDate?: number | null;
    endDate?: number | null;
}

export async function getNotificationsList(options: GetNotificationsListOptions): Promise<NotificationsSyncListResponseType | null> {
    const url = useZust.getState().domainAddress;
    const domain = new URL(`${url}/api/notifications-sync/list`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    if (options.page) domain.searchParams.append('page', String(options.page));
    if (options.timestamp) domain.searchParams.append('timestamp', String(options.timestamp));
    if (options.limit) domain.searchParams.append('limit', String(options.limit));

    if (options.search) domain.searchParams.append('search', options.search);
    if (options.os && options.os !== 'all') domain.searchParams.append('os', options.os);
    if (options.startDate) {
        const startMs = dayjs(options.startDate).startOf('day').valueOf();
        domain.searchParams.append('startDate', String(startMs));
    }
    if (options.endDate) {
        const endMs = dayjs(options.endDate).endOf('day').valueOf();
        domain.searchParams.append('endDate', String(endMs));
    }
    
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