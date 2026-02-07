/**
 * RevenueCat Purchases Service
 * Manages premium subscription state and purchases
 */
import Purchases, {
  PurchasesOffering,
  CustomerInfo,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API Key (from RevenueCat dashboard)
const REVENUECAT_API_KEY = 'goog_wuVIpJcabYOHFbCwysdMQvsWtWU';

// Premium entitlement identifier (configured in RevenueCat)
const PREMIUM_ENTITLEMENT_ID = 'premium';

// Track initialization state
let isConfigured = false;

/**
 * Initialize RevenueCat SDK
 * Call this once at app startup
 */
export async function initializePurchases(): Promise<void> {
  if (isConfigured) {
    return; // Already configured
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    // Configure based on platform
    if (Platform.OS === 'android') {
      await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      isConfigured = true;
    }
    // iOS would use a different API key if needed

    if (__DEV__) {
      console.log('RevenueCat initialized');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to configure RevenueCat:', error);
    }
    // Don't throw - allow app to continue in free mode
  }
}

/**
 * Check if user has active premium subscription
 */
export async function isPremiumUser(): Promise<boolean> {
  if (!isConfigured) {
    return false; // Not configured, assume free user
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;

    if (__DEV__) {
      console.log('Premium status:', isPremium);
    }

    return isPremium;
  } catch (error) {
    if (__DEV__) {
      console.error('Error checking premium status:', error);
    }
    return false;
  }
}

/**
 * Get available subscription offerings
 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!isConfigured) {
    return null; // Not configured
  }

  try {
    const offerings = await Purchases.getOfferings();

    if (offerings.current !== null) {
      if (__DEV__) {
        console.log('Current offering:', offerings.current.identifier);
        console.log('Packages:', offerings.current.availablePackages.map(p => p.identifier));
      }
      return offerings.current;
    }

    return null;
  } catch (error) {
    if (__DEV__) {
      console.error('Error fetching offerings:', error);
    }
    return null;
  }
}

/**
 * Purchase a subscription package
 */
export async function purchasePackage(packageToPurchase: PurchasesPackage): Promise<{
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
}> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

    const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;

    if (__DEV__) {
      console.log('Purchase completed. Premium:', isPremium);
    }

    return {
      success: isPremium,
      customerInfo,
    };
  } catch (error: unknown) {
    // Check if user cancelled
    const purchasesError = error as { userCancelled?: boolean; message?: string };
    if (purchasesError.userCancelled) {
      if (__DEV__) {
        console.log('User cancelled purchase');
      }
      return {
        success: false,
        error: 'cancelled',
      };
    }

    if (__DEV__) {
      console.error('Purchase error:', error);
    }

    return {
      success: false,
      error: purchasesError.message || 'Unknown error',
    };
  }
}

/**
 * Restore previous purchases
 * Useful when user reinstalls app or switches devices
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  isPremium: boolean;
  error?: string;
}> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;

    if (__DEV__) {
      console.log('Restore completed. Premium:', isPremium);
    }

    return {
      success: true,
      isPremium,
    };
  } catch (error: unknown) {
    const errorMessage = (error as { message?: string }).message || 'Unknown error';

    if (__DEV__) {
      console.error('Restore error:', error);
    }

    return {
      success: false,
      isPremium: false,
      error: errorMessage,
    };
  }
}

/**
 * Get customer info (subscription status, purchase history)
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    if (__DEV__) {
      console.error('Error getting customer info:', error);
    }
    return null;
  }
}
