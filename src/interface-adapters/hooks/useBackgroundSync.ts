"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getSyncQueue,
  removeFromSyncQueue,
  incrementRetryCount,
  SyncQueueItem,
} from "@/lib/indexeddb";

const MAX_RETRIES = 3;

interface UseBackgroundSyncReturn {
  /** Number of items pending sync */
  pendingCount: number;
  /** Whether a sync is currently in progress */
  isSyncing: boolean;
  /** Whether background sync is supported */
  isSupported: boolean;
  /** Manually trigger a sync */
  triggerSync: () => Promise<void>;
  /** Last sync timestamp */
  lastSyncAt: Date | null;
}

/**
 * Hook for managing background sync of offline data
 *
 * This handles syncing data that was created/modified while offline.
 * Since this is a local-first app without a backend, we mainly use this
 * for future server sync capability and to manage the sync queue.
 */
export function useBackgroundSync(): UseBackgroundSyncReturn {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  // Check for Background Sync API support
  useEffect(() => {
    const supported = "serviceWorker" in navigator && "SyncManager" in window;
    setIsSupported(supported);

    // Load pending count on mount
    getSyncQueue()
      .then((queue) => setPendingCount(queue.length))
      .catch(console.error);

    // Listen for online events to trigger sync
    const handleOnline = () => {
      // Sync will be triggered via the triggerSync function
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const loadPendingCount = useCallback(async () => {
    try {
      const queue = await getSyncQueue();
      setPendingCount(queue.length);
    } catch (error) {
      console.error("Error loading sync queue:", error);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (isSyncing || !navigator.onLine) return;

    setIsSyncing(true);

    try {
      const queue = await getSyncQueue();

      for (const item of queue) {
        try {
          await processSyncItem(item);
          await removeFromSyncQueue(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);

          if (item.retryCount >= MAX_RETRIES) {
            // Remove after max retries
            await removeFromSyncQueue(item.id);
            console.warn(
              `Removed item ${item.id} after ${MAX_RETRIES} failed attempts`,
            );
          } else {
            await incrementRetryCount(item.id);
          }
        }
      }

      setLastSyncAt(new Date());
      await loadPendingCount();
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, loadPendingCount]);

  return {
    pendingCount,
    isSyncing,
    isSupported,
    triggerSync,
    lastSyncAt,
  };
}

/**
 * Process a single sync queue item
 *
 * Since this is a local-first app without a backend server,
 * this function is a placeholder for future server sync.
 *
 * In a full implementation, this would:
 * 1. Send data to the backend API
 * 2. Handle conflicts (if server has newer data)
 * 3. Update local data with server response
 */
async function processSyncItem(item: SyncQueueItem): Promise<void> {
  // For local-first app, we just mark items as "synced"
  // In production with a backend, this would make API calls

  console.log(`Processing sync item: ${item.type}/${item.action}`, item.data);

  // Simulate network delay for demonstration
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Future implementation example:
  // switch (item.type) {
  //   case 'log':
  //     await syncHeadacheLog(item.action, item.data);
  //     break;
  //   case 'checkin':
  //     await syncCheckIn(item.action, item.data);
  //     break;
  //   case 'settings':
  //     await syncSettings(item.action, item.data);
  //     break;
  // }
}

/**
 * Register a Background Sync with the service worker
 *
 * This tells the browser to wake up the service worker
 * when network becomes available to sync pending data.
 */
export async function registerBackgroundSync(
  tag: string = "headache-sync",
): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    // @ts-expect-error - SyncManager types not in standard lib
    await registration.sync.register(tag);
    return true;
  } catch (error) {
    console.error("Background sync registration failed:", error);
    return false;
  }
}
