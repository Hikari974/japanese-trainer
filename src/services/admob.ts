/**
 * AdMob Service
 * Manages interstitial ads display
 */
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// Ad Unit IDs
// Use test IDs in development, production IDs in release
const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-6788147097826136/4837753426';

// Singleton interstitial ad instance
let interstitialAd: InterstitialAd | null = null;
let isAdLoaded = false;
let isAdLoading = false;

/**
 * Initialize and preload interstitial ad
 * Call this at app startup to have ad ready
 */
export function initializeInterstitialAd(): void {
  if (interstitialAd) {
    // Already initialized
    return;
  }

  interstitialAd = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: false, // Will respect user's ad consent
  });

  // Set up event listeners
  interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    isAdLoaded = true;
    isAdLoading = false;
    if (__DEV__) {
      console.log('Interstitial ad loaded');
    }
  });

  interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
    isAdLoaded = false;
    isAdLoading = false;
    if (__DEV__) {
      console.error('Interstitial ad error:', error);
    }
  });

  interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    isAdLoaded = false;
    if (__DEV__) {
      console.log('Interstitial ad closed');
    }
    // Preload next ad after current one closes
    loadInterstitialAd();
  });

  // Start loading the first ad
  loadInterstitialAd();
}

/**
 * Load/preload an interstitial ad
 */
export function loadInterstitialAd(): void {
  if (!interstitialAd) {
    if (__DEV__) {
      console.warn('InterstitialAd not initialized. Call initializeInterstitialAd first.');
    }
    return;
  }

  if (isAdLoaded || isAdLoading) {
    // Ad already loaded or loading
    return;
  }

  isAdLoading = true;
  interstitialAd.load();

  if (__DEV__) {
    console.log('Loading interstitial ad...');
  }
}

/**
 * Show interstitial ad if loaded
 * Returns a promise that resolves when ad is closed or immediately if no ad available
 */
export async function showInterstitialAd(): Promise<{
  shown: boolean;
  error?: string;
}> {
  if (!interstitialAd) {
    if (__DEV__) {
      console.warn('InterstitialAd not initialized');
    }
    return { shown: false, error: 'not_initialized' };
  }

  if (!isAdLoaded) {
    if (__DEV__) {
      console.log('No ad loaded, skipping');
    }
    // Try to load for next time
    loadInterstitialAd();
    return { shown: false, error: 'not_loaded' };
  }

  return new Promise((resolve) => {
    // Create one-time listener for close event
    const closeListener = interstitialAd!.addAdEventListener(AdEventType.CLOSED, () => {
      closeListener();
      resolve({ shown: true });
    });

    const errorListener = interstitialAd!.addAdEventListener(AdEventType.ERROR, (error) => {
      errorListener();
      resolve({ shown: false, error: error.message });
    });

    // Show the ad
    interstitialAd!.show().catch((error) => {
      if (__DEV__) {
        console.error('Error showing ad:', error);
      }
      resolve({ shown: false, error: error.message });
    });

    isAdLoaded = false; // Mark as not loaded since we're showing it
  });
}

/**
 * Check if an interstitial ad is ready to show
 */
export function isInterstitialAdReady(): boolean {
  return isAdLoaded;
}

/**
 * Clean up ad resources
 * Call when app is closing or no longer needs ads
 */
export function destroyInterstitialAd(): void {
  if (interstitialAd) {
    // The SDK will handle cleanup
    interstitialAd = null;
    isAdLoaded = false;
    isAdLoading = false;

    if (__DEV__) {
      console.log('Interstitial ad destroyed');
    }
  }
}
