import { CollectedNotificationAndroidData } from "@/types/notifications.interface";
import { storage } from "@/utils/storage";
import { useQuery } from "@tanstack/react-query";

export function useLocalNotifications() {
  return useQuery({
    queryKey: ['local_notifications'],
    queryFn: () => {
      const resStr = storage.getString('local_notifications') ?? '[]';
      const local = JSON.parse(resStr) as CollectedNotificationAndroidData[];

      return local;
    },
    
    gcTime: 0,
    staleTime: 0,

    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}