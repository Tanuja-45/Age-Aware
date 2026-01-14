import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Animated } from 'react-native';
import { Shield, Clock, Moon, Key, Fingerprint, CircleAlert as AlertCircle, CircleCheck as CheckCircle, ArrowLeft, Smartphone, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface BlockedApp {
  name: string;
  icon: string;
  lastUsed: string;
}

export default function LockedScreen() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pin, setPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(true);
  const [lockReason, setLockReason] = useState<'bedtime' | 'screen-time' | 'both'>('screen-time');
  const [shakeAnimation] = useState(new Animated.Value(0));

  const [blockedApps] = useState<BlockedApp[]>([
    { name: 'YouTube Kids', icon: '📺', lastUsed: '2 min ago' },
    { name: 'Games', icon: '🎮', lastUsed: '5 min ago' },
    { name: 'Camera', icon: '📷', lastUsed: '1 min ago' },
    { name: 'Gallery', icon: '🖼️', lastUsed: '3 min ago' },
  ]);
  const [childName] = useState('Emma');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Determine lock reason based on current time and mock data
    const now = new Date();
    const bedtimeHour = 21; // 9 PM
    const isBedtime = now.getHours() >= bedtimeHour;
    
    if (isBedtime) {
      setLockReason('bedtime');
    } else {
      setLockReason('screen-time');
    }

    return () => clearInterval(timer);
  }, []);

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePinSubmit = () => {
    const correctPin = '1234'; // In real app, this would be stored securely
    
    if (pin === correctPin) {
      setIsLocked(false);
      Alert.alert(
        'Device Unlocked',
        'Parental override activated. Device restrictions have been temporarily lifted.',
        [
          {
            text: 'Continue',
            onPress: () => router.push('/')
          }
        ]
      );
    } else {
      setAttempts(prev => prev + 1);
      setPin('');
      shakeError();
      
      if (attempts >= 2) {
        Alert.alert(
          'Too Many Attempts',
          'Multiple incorrect PIN attempts detected. Please try again in 30 seconds.',
          [{ text: 'OK' }]
        );
        setShowPinInput(false);
        setTimeout(() => {
          setAttempts(0);
        }, 30000);
      } else {
        Alert.alert(
          'Incorrect PIN',
          `Incorrect PIN entered. ${2 - attempts} attempts remaining.`,
          [{ text: 'Try Again' }]
        );
      }
    }
  };

  const handleFingerprintAuth = () => {
    // Simulate fingerprint authentication
    Alert.alert(
      'Fingerprint Authentication',
      'Place your finger on the fingerprint sensor to unlock the device.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Simulate Success',
          onPress: () => {
            setIsLocked(false);
            Alert.alert(
              'Device Unlocked',
              'Fingerprint authentication successful. Device restrictions have been temporarily lifted.',
              [
                {
                  text: 'Continue',
                  onPress: () => router.push('/')
                }
              ]
            );
          }
        }
      ]
    );
  };

  const getLockMessage = () => {
    switch (lockReason) {
      case 'bedtime':
        return {
          title: `${childName}, It's Bedtime! 🌙`,
          message: 'Your screen time is over for today. Time to put the device away and get some sleep. Good night!',
          color: '#8B5CF6',
          icon: <Moon size={64} color="#8B5CF6" />
        };
      case 'screen-time':
        return {
          title: `${childName}, Screen Time Over! ⏰`,
          message: 'You\'ve used up your daily screen time limit. Time for other fun activities!',
          color: '#F59E0B',
          icon: <Clock size={64} color="#F59E0B" />
        };
      case 'both':
        return {
          title: 'Device Locked',
          message: 'Screen time limit reached and it\'s past bedtime.',
          color: '#EF4444',
          icon: <Shield size={64} color="#EF4444" />
        };
      default:
        return {
          title: 'Device Locked',
          message: 'This device is currently locked.',
          color: '#6B7280',
          icon: <Shield size={64} color="#6B7280" />
        };
    }
  };

  const lockInfo = getLockMessage();

  const handleAppAttempt = (appName: string) => {
    Alert.alert(
      'App Blocked',
      `${appName} is currently blocked due to screen time limits. Ask a parent to unlock the device if needed.`,
      [{ text: 'OK' }]
    );
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <View style={[styles.container, { backgroundColor: lockInfo.color + '10' }]}>
      <View style={styles.header}>
        <Text style={styles.currentTime}>
          {currentTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}
        </Text>
        <Text style={styles.currentDate}>
          {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>

      <View style={styles.lockContent}>
        <View style={styles.autoLockBadge}>
          <Smartphone size={16} color="#FFFFFF" />
          <Text style={styles.autoLockText}>Auto-Locked by AI System</Text>
        </View>
        
        <View style={styles.lockIcon}>
          {lockInfo.icon}
        </View>
        
        <Text style={[styles.lockTitle, { color: lockInfo.color }]}>
          {lockInfo.title}
        </Text>
        
        <Text style={styles.lockMessage}>
          {lockInfo.message}
        </Text>

        <Text style={styles.detectionInfo}>
          Detected: {childName} (6 years, 4-6 group) • Limit: {formatTime(60)}
        </Text>

        <View style={styles.statusContainer}>
          {lockReason === 'screen-time' && (
            <View style={styles.statusItem}>
              <Clock size={16} color="#F59E0B" />
              <Text style={styles.statusText}>Daily limit: 1h 0m reached</Text>
            </View>
          )}
          
          {(lockReason === 'bedtime' || lockReason === 'both') && (
            <View style={styles.statusItem}>
              <Moon size={16} color="#8B5CF6" />
              <Text style={styles.statusText}>Bedtime: 8:30 PM</Text>
            </View>
          )}
        </View>

        <View style={styles.blockedAppsContainer}>
          <Text style={styles.blockedAppsTitle}>Recently Used Apps (Now Blocked)</Text>
          <View style={styles.blockedAppsList}>
            {blockedApps.map((app, index) => (
              <TouchableOpacity
                key={index}
                style={styles.blockedAppItem}
                onPress={() => handleAppAttempt(app.name)}
              >
                <Text style={styles.appIcon}>{app.icon}</Text>
                <Text style={styles.appName}>{app.name}</Text>
                <Text style={styles.appLastUsed}>{app.lastUsed}</Text>
                <X size={16} color="#EF4444" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.parentSection}>
        <Text style={styles.parentTitle}>Parent Override</Text>
        
        {!showPinInput ? (
          <View style={styles.authOptions}>
            <TouchableOpacity 
              style={styles.authButton}
              onPress={() => setShowPinInput(true)}
              disabled={attempts >= 3}
            >
              <Key size={24} color="#FFFFFF" />
              <Text style={styles.authButtonText}>Enter PIN</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.authButton, styles.fingerprintButton]}
              onPress={handleFingerprintAuth}
              disabled={attempts >= 3}
            >
              <Fingerprint size={24} color="#FFFFFF" />
              <Text style={styles.authButtonText}>Fingerprint</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View 
            style={[
              styles.pinContainer,
              {
                transform: [{ translateX: shakeAnimation }]
              }
            ]}
          >
            <Text style={styles.pinLabel}>Enter 4-digit Parent PIN</Text>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              placeholder="••••"
              placeholderTextColor="#9CA3AF"
            />
            
            <View style={styles.pinActions}>
              <TouchableOpacity 
                style={styles.pinCancel}
                onPress={() => {
                  setShowPinInput(false);
                  setPin('');
                }}
              >
                <ArrowLeft size={20} color="#6B7280" />
                <Text style={styles.pinCancelText}>Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.pinSubmit,
                  { opacity: pin.length === 4 ? 1 : 0.5 }
                ]}
                onPress={handlePinSubmit}
                disabled={pin.length !== 4}
              >
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.pinSubmitText}>Unlock</Text>
              </TouchableOpacity>
            </View>
            
            {attempts > 0 && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>
                  Incorrect PIN. {3 - attempts} attempts remaining.
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {attempts >= 3 && (
          <View style={styles.lockoutContainer}>
            <AlertCircle size={20} color="#EF4444" />
            <Text style={styles.lockoutText}>
              Too many failed attempts. Please try again later.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🔄 System will automatically detect when {childName} stops using the device
        </Text>
        <Text style={styles.footerText}>
          📅 Screen time resets tomorrow at 6:00 AM
        </Text>
        <Text style={styles.emergencyText}>
          For emergencies, contact a parent or guardian
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
  },
  currentDate: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  autoLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  autoLockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  lockContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
    flex: 1,
    justifyContent: 'center',
  },
  lockIcon: {
    marginBottom: 24,
  },
  lockTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  lockMessage: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
  },
  detectionInfo: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  blockedAppsContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  blockedAppsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  blockedAppsList: {
    gap: 8,
  },
  blockedAppItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  appIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  appLastUsed: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  parentSection: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  parentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  authOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  authButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  fingerprintButton: {
    backgroundColor: '#10B981',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pinContainer: {
    alignItems: 'center',
  },
  pinLabel: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
    fontWeight: '500',
  },
  pinInput: {
    width: 120,
    height: 48,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 16,
  },
  pinActions: {
    flexDirection: 'row',
    gap: 16,
  },
  pinCancel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    gap: 6,
  },
  pinCancelText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  pinSubmit: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#10B981',
    borderRadius: 8,
    gap: 6,
  },
  pinSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  lockoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  lockoutText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});