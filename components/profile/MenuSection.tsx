import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface MenuItem {
  id: string;
  title: string;
  icon: any;
  subtitle: string;
  onPress: () => void;
}

interface MenuSectionProps {
  onSettingsPress: () => void;
  onNotificationsPress: () => void;
  onPrivacyPress: () => void;
  onHelpPress: () => void;
  onLogout: () => void;
}

export default function MenuSection({
  onSettingsPress,
  onNotificationsPress,
  onPrivacyPress,
  onHelpPress,
  onLogout,
}: MenuSectionProps) {
  const { t } = useTranslation(['profile']);
  const menuItems: MenuItem[] = [
    { 
      id: '1', 
      title: t('profile:settings'), 
      icon: Settings, 
      subtitle: t('profile:settingsSubtitle'),
      onPress: onSettingsPress
    },
    { 
      id: '2', 
      title: t('profile:notifications'), 
      icon: Bell, 
      subtitle: t('profile:notificationsSubtitle'),
      onPress: onNotificationsPress
    },
    { 
      id: '3', 
      title: t('profile:privacy'), 
      icon: Shield, 
      subtitle: t('profile:privacySubtitle'),
      onPress: onPrivacyPress
    },
    { 
      id: '4', 
      title: t('profile:help'), 
      icon: HelpCircle, 
      subtitle: t('profile:helpSubtitle'),
      onPress: onHelpPress
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      t('profile:logoutTitle'),
      t('profile:logoutConfirm'),
      [
        { text: t('common:cancel'), style: 'cancel' },
        { text: t('profile:logout'), style: 'destructive', onPress: onLogout },
      ]
    );
  };

  return (
    <View style={styles.menuContainer}>
      <Text style={styles.sectionTitle}>{t('profile:settings')}</Text>
      {menuItems.map((item) => (
        <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIconContainer}>
              <item.icon size={20} color="#6B7280" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      ))}
      
      {/* Logout Button */}
      <TouchableOpacity style={[styles.menuItem, styles.logoutMenuItem]} onPress={handleLogout}>
        <View style={styles.menuItemLeft}>
          <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
            <LogOut size={20} color="#EF4444" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuItemTitle, styles.logoutText]}>{t('profile:logout')}</Text>
            <Text style={styles.menuItemSubtitle}>{t('profile:logoutSubtitle')}</Text>
          </View>
        </View>
        <Text style={styles.menuItemArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent', // Usuwam tło
    paddingVertical: 16, // Zmieniam padding z 16 na paddingVertical
    paddingHorizontal: 0, // Usuwam padding poziomy
    borderRadius: 0, // Usuwam zaokrąglone rogi
    marginBottom: 0, // Usuwam margines
    borderBottomWidth: 1, // Dodaję linię oddzielającą
    borderBottomColor: '#E5E7EB', // Kolor linii
    shadowColor: 'transparent', // Usuwam cień
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  logoutMenuItem: {
    marginTop: 8,
    borderBottomWidth: 0, // Usuwam linię dla ostatniego elementu
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutIconContainer: {
    backgroundColor: '#FEF2F2',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
    marginBottom: 2,
  },
  logoutText: {
    color: '#EF4444',
  },
  menuItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  menuItemArrow: {
    fontSize: 24,
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
  },
}); 