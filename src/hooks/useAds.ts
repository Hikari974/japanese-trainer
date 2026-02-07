/**
 * useAds Hook
 * React hook for managing ad display
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  initializeInterstitialAd,
  showInterstitialAd,
  isInterstitialAdReady,
  loadInterstitialAd,
  destroyInterstitialAd,
} from '../services/admob';

interface UseAdsResult {
  isAdReady: boolean;
  showAd: () => Promise<{ shown: boolean; error?: string }>;
  preloadAd: () => void;
}

/**
 * Hook for managing interstitial ads
 * @param shouldInitialize - Whether to initialize ads (false for premium users)
 */
export function useAds(shouldInitialize: boolean = true): UseAdsResult {
  const [isAdReady, setIsAdReady] = useState(false);
  const isInitialized = useRef(false);
  const checkInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize ad system
  useEffect(() => {
    if (!shouldInitialize) {
      // Premium user or ads disabled
      return;
    }

    if (!isInitialized.current) {
      initializeInterstitialAd();
      isInitialized.current = true;
    }

    // Periodically check if ad is ready
    checkInterval.current = setInterval(() => {
      const ready = isInterstitialAdReady();
      setIsAdReady(ready);
    }, 1000);

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [shouldInitialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't destroy on unmount as we want ads ready for next session
      // destroyInterstitialAd();
    };
  }, []);

  // Show interstitial ad
  const showAd = useCallback(async () => {
    if (!shouldInitialize) {
      return { shown: false, error: 'ads_disabled' };
    }

    const result = await showInterstitialAd();

    // Update ready state after showing
    setIsAdReady(isInterstitialAdReady());

    return result;
  }, [shouldInitialize]);

  // Preload next ad
  const preloadAd = useCallback(() => {
    if (!shouldInitialize) return;
    loadInterstitialAd();
  }, [shouldInitialize]);

  return {
    isAdReady,
    showAd,
    preloadAd,
  };
}
