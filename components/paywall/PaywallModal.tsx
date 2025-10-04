import React, { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView, LayoutChangeEvent, Pressable, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import { X } from 'lucide-react-native';
import { PurchasesStoreProduct } from 'react-native-purchases';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  products: PurchasesStoreProduct[];
  selectedProductId: string | null;
  onSelectProduct: (id: string) => void;
  onPurchase: (product?: PurchasesStoreProduct) => void | Promise<void>;
  onRestore: () => void | Promise<void>;
  loading: boolean;
}

export default function PaywallModal(props: PaywallModalProps) {
  const { visible, onClose, products, selectedProductId, onSelectProduct, onPurchase, onRestore, loading } = props;
  const { t } = useTranslation(['paywall']);
  const extra = (Constants.expoConfig?.extra as any) ?? {};
  const termsUrl: string | undefined = extra.termsUrl;
  const privacyUrl: string | undefined = extra.privacyUrl;
  const eulaUrl: string = extra.eulaUrl ?? 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
  const [trialEnabled, setTrialEnabled] = useState<boolean>(true);
  // Banner sizing to ensure bottom edge aligns to container bottom (cover with bottom gravity)
  const bannerSource = require('@/assets/images/subscription-image.png');
  const bannerAsset = Image.resolveAssetSource(bannerSource);
  const [bannerWidth, setBannerWidth] = useState<number | null>(null);
  const bannerHeight = 180;
  const bannerScale = bannerWidth ? Math.max(bannerWidth / bannerAsset.width, bannerHeight / bannerAsset.height) : 1;
  const bannerRenderWidth = bannerWidth ? bannerAsset.width * bannerScale : undefined;
  const bannerRenderHeight = bannerWidth ? bannerAsset.height * bannerScale : bannerHeight;
  const bannerLeft = bannerWidth && bannerRenderWidth ? (bannerWidth - bannerRenderWidth) / 2 : 0;
  const openUrl = async (url?: string) => {
    if (!url) return;
    try { await WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET }); } catch {}
  };

  const selectedProduct = products.find((p) => p.identifier === selectedProductId) ?? null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Close */}
          <TouchableOpacity style={styles.close} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
            <X size={22} color="#6B7280" />
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Decorative banner */}
            <View
              style={styles.bannerWrap}
              onLayout={(e: LayoutChangeEvent) => setBannerWidth(e.nativeEvent.layout.width)}
            >
              <Image
                source={bannerSource}
                style={[
                  styles.banner,
                  {
                    position: 'absolute',
                    bottom: 0,
                    left: bannerLeft,
                    width: bannerRenderWidth ?? '100%',
                    height: bannerRenderHeight,
                  },
                ]}
              />
            </View>

            <Text style={styles.title}>{t('paywall:title', 'Unlock full access')}</Text>
            <Text style={styles.subtitle}>{t('paywall:subtitle', 'Train with AI, track progress, hit goals faster.')}</Text>

            {/* Social proof */}
            <View style={styles.starsRow}>
              <Text style={styles.star}>★★★★★</Text>
              <Text style={styles.starSub}>{t('paywall:socialProof', 'Trusted by hundreds of users')}</Text>
            </View>

            {/* Trial toggle hint (visual only) */}
            <View style={styles.trialRow}>
              <Text style={styles.trialLabel}>{t('paywall:trialToggle', 'Not sure yet? Enable free trial')}</Text>
              <AnimatedSwitch
                value={trialEnabled}
                onValueChange={(value) => {
                  setTrialEnabled(value);
                  if (value) {
                    const weekly = products.find(p => p.identifier.includes('week'));
                    if (weekly) onSelectProduct(weekly.identifier);
                  }
                }}
              />
            </View>

            {/* Plans */}
            <View style={styles.plans}>
              {loading ? (
                <View style={styles.loadingPlans}>
                  <ActivityIndicator color="#2563EB" />
                </View>
              ) : (
                products.map((p) => {
                  const isSelected = p.identifier === selectedProductId;
                  const isYearly = p.identifier.includes('year');
                  const isMonthly = p.identifier.includes('month');
                  const isWeekly = p.identifier.includes('week');
                  // Small scale animation on press for nicer feedback
                  const scale = new Animated.Value(1);
                  const handlePressIn = () => Animated.timing(scale, { toValue: 0.98, duration: 100, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
                  const handlePressOut = () => Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
                  return (
                    <Pressable
                      key={p.identifier}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      style={({ pressed }) => [
                        styles.planItem,
                        isSelected && styles.planItemActive,
                        { transform: [{ scale: isSelected ? 1 : 1 }] },
                      ]}
                      onPress={async () => {
                        try { await Haptics.selectionAsync(); } catch {}
                        onSelectProduct(p.identifier);
                        // Auto-toggle trial: ON only for weekly, OFF otherwise
                        if (isWeekly) setTrialEnabled(true); else setTrialEnabled(false);
                      }}
                      accessibilityRole="button"
                    >
                      <Animated.View style={[styles.planLeft, { transform: [{ scale }] }]}>
                        <View style={[styles.radio, isSelected && styles.radioActive]} />
                        <Text style={styles.planTitle}>
                          {isYearly ? t('paywall:yearly', 'Yearly') : isMonthly ? t('paywall:monthly', 'Monthly') : t('paywall:weekly', 'Weekly')}
                        </Text>
                      </Animated.View>
                      <View style={styles.planRight}>
                        <Text style={styles.planPriceSecondary}>{p.priceString}</Text>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.ctaButton, !selectedProduct && styles.ctaDisabled]}
              onPress={() => selectedProduct && onPurchase(selectedProduct)}
              disabled={!selectedProduct}
            >
              <Text style={styles.ctaText}>
                {(() => {
                  const id = selectedProduct?.identifier ?? '';
                  const isYearly = id.includes('year');
                  const isMonthly = id.includes('month');
                  const isWeekly = id.includes('week');
                  if (trialEnabled && isWeekly) return t('paywall:ctaTrialWeekly', 'Start 1 week free trial');
                  if (isYearly) return t('paywall:ctaYearly', 'Continue with Yearly');
                  if (isMonthly) return t('paywall:ctaMonthly', 'Continue with Monthly');
                  if (isWeekly) return t('paywall:ctaWeekly', 'Continue with Weekly');
                  return t('paywall:ctaGeneric', 'Continue');
                })()}
              </Text>
            </TouchableOpacity>

            {/* Footer links */}
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={onRestore}><Text style={styles.link}>{t('paywall:restore', 'Restore Purchases')}</Text></TouchableOpacity>
              <Text style={styles.dot}>•</Text>
              <TouchableOpacity onPress={() => openUrl(termsUrl)}><Text style={styles.link}>{t('paywall:terms', 'Terms')}</Text></TouchableOpacity>
              <Text style={styles.dot}>•</Text>
              <TouchableOpacity onPress={() => openUrl(privacyUrl)}><Text style={styles.link}>{t('paywall:privacy', 'Privacy')}</Text></TouchableOpacity>
              <Text style={styles.dot}>•</Text>
              <TouchableOpacity onPress={() => openUrl(eulaUrl)}><Text style={styles.link}>{t('paywall:eula', 'EULA')}</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Simple animated switch styled like our UI
function AnimatedSwitch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const anim = React.useRef(new Animated.Value(value ? 1 : 0)).current;
  React.useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 180, useNativeDriver: false, easing: Easing.out(Easing.quad) }).start();
  }, [value]);

  const bg = anim.interpolate({ inputRange: [0, 1], outputRange: ['#D1D5DB', '#2563EB'] });
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });

  return (
    <Pressable onPress={async () => { try { await Haptics.selectionAsync(); } catch {}; onValueChange(!value); }} accessibilityRole="switch" accessibilityState={{ checked: value }}>
      <Animated.View style={{ width: 46, height: 28, borderRadius: 14, backgroundColor: bg, paddingHorizontal: 2, justifyContent: 'center' }}>
        <Animated.View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', transform: [{ translateX }] }} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  close: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 2,
    padding: 8,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  content: {
    paddingBottom: 20,
  },
  bannerWrap: {
    width: '100%',
    height: 180,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  banner: {
    width: '100%',
    height: 180,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    paddingHorizontal: 20,
    marginTop: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  star: {
    color: '#F59E0B',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  starSub: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  trialRow: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trialLabel: {
    color: '#0C4A6E',
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    flex: 1,
    paddingRight: 10,
  },
  plans: {
    padding: 20,
    gap: 12,
  },
  loadingPlans: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  planItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planItemActive: {
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  radioActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF6',
  },
  planTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  planRight: {},
  // removed badge styles
  planPriceSecondary: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  ctaButton: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 12,
  },
  link: {
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  dot: {
    color: '#D1D5DB',
  },
});


