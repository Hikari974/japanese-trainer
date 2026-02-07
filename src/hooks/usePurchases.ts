/**
 * usePurchases Hook
 * React hook for managing premium subscription state
 */
import { useState, useEffect, useCallback } from 'react';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import {
  initializePurchases,
  isPremiumUser,
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '../services/purchases';

interface UsePurchasesResult {
  isPremium: boolean;
  isLoading: boolean;
  offerings: PurchasesOffering | null;
  purchase: (pkg: PurchasesPackage) => Promise<{ success: boolean; error?: string }>;
  restore: () => Promise<{ success: boolean; isPremium: boolean; error?: string }>;
  refreshStatus: () => Promise<void>;
}

export function usePurchases(): UsePurchasesResult {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize RevenueCat and check status with timeout
  useEffect(() => {
    let isMounted = true;
    const INIT_TIMEOUT = 5000; // 5 seconds timeout

    async function initialize() {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Initialization timeout')), INIT_TIMEOUT)
        );

        await Promise.race([initializePurchases(), timeoutPromise]);

        if (!isMounted) return;
        setIsInitialized(true);

        // Check premium status with timeout
        const premium = await Promise.race([
          isPremiumUser(),
          new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3000))
        ]);
        if (!isMounted) return;
        setIsPremium(premium);

        // Load offerings (non-blocking)
        getOfferings().then((currentOfferings) => {
          if (isMounted) setOfferings(currentOfferings);
        }).catch(() => {});

      } catch (error) {
        if (__DEV__) {
          console.error('Failed to initialize purchases:', error);
        }
        // Continue with free mode if initialization fails
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  // Purchase a package
  const purchase = useCallback(async (pkg: PurchasesPackage) => {
    if (!isInitialized) {
      return { success: false, error: 'not_initialized' };
    }

    setIsLoading(true);
    try {
      const result = await purchasePackage(pkg);
      if (result.success) {
        setIsPremium(true);
      }
      return { success: result.success, error: result.error };
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Restore purchases
  const restore = useCallback(async () => {
    if (!isInitialized) {
      return { success: false, isPremium: false, error: 'not_initialized' };
    }

    setIsLoading(true);
    try {
      const result = await restorePurchases();
      if (result.isPremium) {
        setIsPremium(true);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Refresh premium status
  const refreshStatus = useCallback(async () => {
    if (!isInitialized) return;

    const premium = await isPremiumUser();
    setIsPremium(premium);
  }, [isInitialized]);

  return {
    isPremium,
    isLoading,
    offerings,
    purchase,
    restore,
    refreshStatus,
  };
}
