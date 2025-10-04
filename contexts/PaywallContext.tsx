import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { LOG_LEVEL, PurchasesStoreProduct } from 'react-native-purchases';
import Constants from 'expo-constants';
import PaywallModal from '@/components/paywall/PaywallModal';

type PaywallContextType = {
  isVisible: boolean;
  open: () => void;
  close: () => void;
  products: PurchasesStoreProduct[];
  loadingProducts: boolean;
  purchase: (product?: PurchasesStoreProduct) => Promise<void>;
  restorePurchases: () => Promise<void>;
  showOnLaunch: boolean;
  setShowOnLaunch: (value: boolean) => Promise<void>;
  selectedProductId: string | null;
  selectProduct: (id: string) => void;
};

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

const STORAGE_KEY_SHOW_ON_LAUNCH = 'paywall_show_on_launch';
const STORAGE_KEY_LAST_SHOWN_AT = 'paywall_last_shown_at';

const PRODUCT_IDS = ['rehand_yearly', 'rehand_monthly', 'rehand_weekly'];

export function PaywallProvider({ children }: { children: React.ReactNode }) {
  const [configured, setConfigured] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showOnLaunch, setShowOnLaunchState] = useState(true);
  const [products, setProducts] = useState<PurchasesStoreProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const hasAttemptedOpenRef = useRef(false);

  // Resolve API key from env or app.json extra
  const apiKey = useMemo(() => {
    const extra = (Constants.expoConfig?.extra as any) ?? {};
    const iosKey = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? extra.revenuecatIosKey;
    const androidKey = process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? extra.revenuecatAndroidKey;
    const genericKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? extra.revenuecatApiKey;
    if (Platform.OS === 'ios') return iosKey ?? genericKey;
    if (Platform.OS === 'android') return androidKey ?? genericKey;
    return genericKey ?? iosKey ?? androidKey;
  }, []);

  // Configure RevenueCat once
  useEffect(() => {
    async function configure() {
      try {
        if (!apiKey) {
          console.warn('[Paywall] Missing RevenueCat API key. Set EXPO_PUBLIC_RC_IOS_KEY / EXPO_PUBLIC_RC_ANDROID_KEY or extra.revenuecat* in app.json');
          return;
        }
        // Helpful logs during development
        if (__DEV__) {
          await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }
        Purchases.configure({ apiKey });
        setConfigured(true);
      } catch (e) {
        console.error('[Paywall] Error configuring RevenueCat', e);
      }
    }
    configure();
  }, [apiKey]);

  // Load preference for showing on launch
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_SHOW_ON_LAUNCH)
      .then((v) => {
        if (v === null) {
          setShowOnLaunchState(true);
        } else {
          setShowOnLaunchState(v === 'true');
        }
      })
      .catch(() => setShowOnLaunchState(true));
  }, []);

  // Fetch products after configuration
  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      if (!configured) return;
      setLoadingProducts(true);
      try {
        const fetched = await Purchases.getProducts(PRODUCT_IDS);
        if (!cancelled) {
          // Sort by our desired order (yearly, monthly, weekly)
          const order = new Map(PRODUCT_IDS.map((id, idx) => [id, idx]));
          const sorted = [...fetched].sort((a, b) => {
            return (order.get(a.identifier) ?? 999) - (order.get(b.identifier) ?? 999);
          });
          setProducts(sorted);
          // Default selection to yearly if available
          const defaultId = sorted.find((p) => p.identifier === 'rehand_yearly')?.identifier ?? sorted[0]?.identifier ?? null;
          setSelectedProductId(defaultId);
        }
      } catch (e) {
        console.error('[Paywall] Failed to fetch products', e);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }
    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [configured]);

  // Open paywall on app launch (soft): don't require SDK to be configured
  useEffect(() => {
    if (!showOnLaunch || hasAttemptedOpenRef.current) return;
    hasAttemptedOpenRef.current = true;
    const t = setTimeout(() => setIsVisible(true), 450);
    return () => clearTimeout(t);
  }, [showOnLaunch]);

  const open = useCallback(() => {
    setIsVisible(true);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
  }, []);

  const setShowOnLaunch = useCallback(async (value: boolean) => {
    try {
      setShowOnLaunchState(value);
      await AsyncStorage.setItem(STORAGE_KEY_SHOW_ON_LAUNCH, value ? 'true' : 'false');
    } catch {}
  }, []);

  const purchase = useCallback(async (productArg?: PurchasesStoreProduct) => {
    try {
      if (!configured) throw new Error('Purchases not configured');
      const productToBuy = productArg ?? products.find((p) => p.identifier === selectedProductId);
      if (!productToBuy) throw new Error('Product not selected');
      const { customerInfo } = await Purchases.purchaseStoreProduct(productToBuy);
      // Close paywall after purchase succeeds
      setIsVisible(false);
      return;
    } catch (e: any) {
      // Ignore user cancellations
      if (e?.userCancelled) return;
      console.error('[Paywall] Purchase error', e);
    }
  }, [configured, products, selectedProductId]);

  const restorePurchases = useCallback(async () => {
    try {
      if (!configured) throw new Error('Purchases not configured');
      await Purchases.restorePurchases();
      setIsVisible(false);
    } catch (e) {
      console.error('[Paywall] Restore error', e);
    }
  }, [configured]);

  const selectProduct = useCallback((id: string) => {
    setSelectedProductId(id);
  }, []);

  const value: PaywallContextType = {
    isVisible,
    open,
    close,
    products,
    loadingProducts,
    purchase,
    restorePurchases,
    showOnLaunch,
    setShowOnLaunch,
    selectedProductId,
    selectProduct,
  };

  return (
    <PaywallContext.Provider value={value}>
      {children}
      <PaywallModal
        visible={isVisible}
        onClose={close}
        products={products}
        selectedProductId={selectedProductId}
        onSelectProduct={selectProduct}
        onPurchase={purchase}
        onRestore={restorePurchases}
        loading={loadingProducts}
      />
    </PaywallContext.Provider>
  );
}

export function usePaywall() {
  const ctx = useContext(PaywallContext);
  if (!ctx) throw new Error('usePaywall must be used within PaywallProvider');
  return ctx;
}


