import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert } from 'react-native';
import { Settings, Shield, Clock, Moon, Users, Bell, Key, Smartphone } from 'lucide-react-native';

interface ParentSettings {
  parentPin: string;
  fingerprintEnabled: boolean;
  emergencyOverride: boolean;
  notificationsEnabled: boolean;
  strictMode: boolean;
}

interface AgeGroupSettings {
  [key: string]: {
    screenTimeLimit: number;
    bedtime: string;
    enabled: boolean;
  };
}

export default function SettingsScreen() {
  const [parentSettings, setParentSettings] = useState<ParentSettings>({
    parentPin: '1234',
    fingerprintEnabled: true,
    emergencyOverride: true,
    notificationsEnabled: true,
    strictMode: false,
  });

  const [ageGroupSettings, setAgeGroupSettings] = useState<AgeGroupSettings>({
    '1-3': { screenTimeLimit: 45, bedtime: '20:00', enabled: true },
    '4-6': { screenTimeLimit: 60, bedtime: '20:30', enabled: true },
    '7-9': { screenTimeLimit: 90, bedtime: '21:00', enabled: true },
    '10-12': { screenTimeLimit: 120, bedtime: '21:30', enabled: true },
    '13-15': { screenTimeLimit: 150, bedtime: '22:00', enabled: true },
  });

  const [showPinInput, setShowPinInput] = useState(false);
  const [newPin, setNewPin] = useState('');

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const updateParentSetting = (key: keyof ParentSettings, value: any) => {
    setParentSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateAgeGroupSetting = (ageGroup: string, key: string, value: any) => {
    setAgeGroupSettings(prev => ({
      ...prev,
      [ageGroup]: { ...prev[ageGroup], [key]: value }
    }));
  };

  const handlePinChange = () => {
    if (newPin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits');
      return;
    }
    
    setParentSettings(prev => ({ ...prev, parentPin: newPin }));
    setNewPin('');
    setShowPinInput(false);
    Alert.alert('Success', 'Parent PIN updated successfully');
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setParentSettings({
              parentPin: '1234',
              fingerprintEnabled: true,
              emergencyOverride: true,
              notificationsEnabled: true,
              strictMode: false,
            });
            setAgeGroupSettings({
              '1-3': { screenTimeLimit: 45, bedtime: '20:00', enabled: true },
              '4-6': { screenTimeLimit: 60, bedtime: '20:30', enabled: true },
              '7-9': { screenTimeLimit: 90, bedtime: '21:00', enabled: true },
              '10-12': { screenTimeLimit: 120, bedtime: '21:30', enabled: true },
              '13-15': { screenTimeLimit: 150, bedtime: '22:00', enabled: true },
            });
            Alert.alert('Success', 'Settings reset to defaults');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Settings size={28} color="#3B82F6" />
        <Text style={styles.headerTitle}>Parent Settings</Text>
        <Text style={styles.headerSubtitle}>Configure app behavior and parental controls</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={24} color="#EF4444" />
          <Text style={styles.sectionTitle}>Security & Authentication</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Parent PIN</Text>
            <Text style={styles.settingDescription}>
              4-digit PIN for overriding device locks
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.changeButton}
            onPress={() => setShowPinInput(true)}
          >
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>

        {showPinInput && (
          <View style={styles.pinInputContainer}>
            <TextInput
              style={styles.pinInput}
              placeholder="Enter new 4-digit PIN"
              value={newPin}
              onChangeText={setNewPin}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
            <TouchableOpacity style={styles.confirmButton} onPress={handlePinChange}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => {
                setShowPinInput(false);
                setNewPin('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Fingerprint Authentication</Text>
            <Text style={styles.settingDescription}>
              Use fingerprint to override locks (if supported)
            </Text>
          </View>
          <Switch
            value={parentSettings.fingerprintEnabled}
            onValueChange={(value) => updateParentSetting('fingerprintEnabled', value)}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor={parentSettings.fingerprintEnabled ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Emergency Override</Text>
            <Text style={styles.settingDescription}>
              Allow parents to bypass all restrictions in emergencies
            </Text>
          </View>
          <Switch
            value={parentSettings.emergencyOverride}
            onValueChange={(value) => updateParentSetting('emergencyOverride', value)}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor={parentSettings.emergencyOverride ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={24} color="#F59E0B" />
          <Text style={styles.sectionTitle}>Notifications & Alerts</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive alerts about screen time limits and violations
            </Text>
          </View>
          <Switch
            value={parentSettings.notificationsEnabled}
            onValueChange={(value) => updateParentSetting('notificationsEnabled', value)}
            trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
            thumbColor={parentSettings.notificationsEnabled ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Strict Mode</Text>
            <Text style={styles.settingDescription}>
              No warnings - immediately lock device when limits reached
            </Text>
          </View>
          <Switch
            value={parentSettings.strictMode}
            onValueChange={(value) => updateParentSetting('strictMode', value)}
            trackColor={{ false: '#E5E7EB', true: '#EF4444' }}
            thumbColor={parentSettings.strictMode ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Users size={24} color="#10B981" />
          <Text style={styles.sectionTitle}>Age Group Settings</Text>
        </View>

        {Object.entries(ageGroupSettings).map(([ageGroup, settings]) => (
          <View key={ageGroup} style={styles.ageGroupCard}>
            <View style={styles.ageGroupHeader}>
              <Text style={styles.ageGroupTitle}>{ageGroup} Years</Text>
              <Switch
                value={settings.enabled}
                onValueChange={(value) => updateAgeGroupSetting(ageGroup, 'enabled', value)}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                thumbColor={settings.enabled ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
            
            {settings.enabled && (
              <>
                <View style={styles.ageGroupSetting}>
                  <Clock size={16} color="#3B82F6" />
                  <Text style={styles.ageGroupLabel}>Screen Time Limit</Text>
                  <Text style={styles.ageGroupValue}>{formatTime(settings.screenTimeLimit)}</Text>
                </View>
                
                <View style={styles.ageGroupSetting}>
                  <Moon size={16} color="#8B5CF6" />
                  <Text style={styles.ageGroupLabel}>Bedtime</Text>
                  <Text style={styles.ageGroupValue}>{settings.bedtime}</Text>
                </View>
              </>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Smartphone size={24} color="#6B7280" />
          <Text style={styles.sectionTitle}>Device Information</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>AI Model Version</Text>
          <Text style={styles.infoValue}>MobileNetV3-v1.0</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last Model Update</Text>
          <Text style={styles.infoValue}>December 2024</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          This app is designed to help parents manage their children's screen time. 
          Age detection is performed locally on the device using advanced AI models. 
          No personal data is transmitted to external servers.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  changeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  pinInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  ageGroupCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  ageGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ageGroupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  ageGroupSetting: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  ageGroupLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  ageGroupValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimerContainer: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    textAlign: 'center',
  },
});