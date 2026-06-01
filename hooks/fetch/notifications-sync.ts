import { getNotificationsList } from "@/controller/notificationsSyncController";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export function useNotificationsSyncList() {
    const [initialTimestamp, setInitialTimestamp] = useState(() => Date.now());

    const query = useInfiniteQuery({
        queryKey: ['notifications-sync-list', initialTimestamp],
        queryFn: async ({ pageParam }) => {
            const data = await getNotificationsList({
                limit: 10,
                timestamp: pageParam,
            });

            if (!data) return null;
            return data;
        },
        initialPageParam: initialTimestamp,
        getNextPageParam: (lastPage) => {
            if (lastPage?.pagination?.hasNext && lastPage.data) {
                return Number(lastPage.data[lastPage.data.length - 1].android.timestamp);
            }

            return undefined;
        },

        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,

        staleTime: 0,
        gcTime: 0,
    });

    const refetch = useCallback(() => {
        setInitialTimestamp(Date.now());
    }, []);

    return {
        ...query,
        refetch,
    };
};