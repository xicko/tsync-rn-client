import { getNotificationsList } from "@/controller/notificationsSyncController";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useNotificationsSyncList() {
    return useInfiniteQuery({
        queryKey: ['notifications-sync-list'],
        queryFn: async ({ pageParam = 1 }) => {
            const data = await getNotificationsList(pageParam, 10);

            if (!data) return null;
            return data;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
        if (lastPage?.pagination?.hasNext) {
            return allPages?.length + 1;
        }

        return undefined;
        },

        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
    });
};