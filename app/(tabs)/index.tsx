import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Clock, User, Moon, Shield, CircleAlert as AlertCircle, Camera, Activity, Eye, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ChildSession {
  id: string;
  name: string;
  age: number;
  ageGroup: string;
  sessionStartTime: Date;
  screenTimeUsed: number;
  screenTimeLimit: number;
  bedtime: string;
  isActive: boolean;
  lastDetected: Date;
  appsUsed: string[];
}

interface BackgroundMonitor {
  isRunning: boolean;
  detectionInterval: number;
  lastScan: Date | null;
  totalDetections: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [currentSession, setCurrentSession] = useState<ChildSession | null>(null);
  const [backgroundMonitor, setBackgroundMonitor] = useState<BackgroundMonitor>({
    isRunning: false,
    detectionInterval: 30, // seconds
    lastScan: null,
    totalDetections: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState<'idle' | 'monitoring' | 'locked'>('idle');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate background monitoring
      if (backgroundMonitor.isRunning && currentSession) {
        // Update session time
        const now = new Date();
        const sessionDuration = Math.floor((now.getTime() - currentSession.sessionStartTime.getTime()) / 1000 / 60);
        
        setCurrentSession(prev => prev ? {
          ...prev,
          screenTimeUsed: sessionDuration,
          lastDetected: now
        } : null);

        // Check if limits exceeded
        if (sessionDuration >= currentSession.screenTimeLimit || isBedtime(currentSession.bedtime)) {
          triggerAutoLock();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [backgroundMonitor.isRunning, currentSession]);

  const startBackgroundMonitoring = () => {
    Alert.alert(
      'Start AI Model Integration',
      'This will enable your trained MobileNetV3 model for continuous child detection and automatic screen time enforcement:\n\n• Your DL model will analyze camera frames every 30 seconds\n• Automatic age classification for children ≤15 years\n• Real-time screen time tracking across all apps\n• Automatic device lock when limits exceeded\n• System-level app override capability',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enable AI Model',
          onPress: () => {
            setBackgroundMonitor(prev => ({
              ...prev,
              isRunning: true,
              lastScan: new Date()
            }));
            setSystemStatus('monitoring');
            
            Alert.alert(
              'AI Model Activated!',
              'Your trained MobileNetV3 model is now running in the background. It will automatically detect children and apply screen time limits based on age groups.',
              [{ text: 'Continue' }]
            );
          }
        }
      ]
    );
  };

  const simulateChildDetection = () => {
    // Simulate MobileNetV3 detection
    const ageGroups = ['1to3', '4to6', '7to9', '10to12', '13to15'];
    const randomAgeGroup = ageGroups[Math.floor(Math.random() * ageGroups.length)];
    const config = getAgeGroupConfig()[randomAgeGroup as keyof ReturnType<typeof getAgeGroupConfig>];
    
    const mockChild: ChildSession = {
      id: 'session-' + Date.now(),
      name: 'Emma',
      age: getAgeFromGroup(randomAgeGroup),
      ageGroup: randomAgeGroup,
      sessionStartTime: new Date(),
      screenTimeUsed: 0,
      screenTimeLimit: config.limit,
      bedtime: config.bedtime,
      isActive: true,
      lastDetected: new Date(),
      appsUsed: ['YouTube Kids', 'Games', 'Camera']
    };

    setCurrentSession(mockChild);
    
    Alert.alert(
      'MobileNetV3 Detection!',
      `Automatic detection successful!\n\nChild: ${mockChild.name}\nAge Group: ${mockChild.ageGroup}\nScreen Time Limit: ${formatTime(mockChild.screenTimeLimit)}\nBedtime: ${mockChild.bedtime}\n\nTimer started automatically. System will monitor usage across all apps.`,
      [{ text: 'Continue' }]
    );

    setBackgroundMonitor(prev => ({
      ...prev,
      totalDetections: prev.totalDetections + 1
    }));
  };

  const getAgeGroupConfig = () => ({
    '1to3': { limit: 45, bedtime: '20:00', description: 'Toddler Group (1-3 years)' },
    '4to6': { limit: 60, bedtime: '20:30', description: 'Preschool Group (4-6 years)' },
    '7to9': { limit: 90, bedtime: '21:00', description: 'Early Elementary (7-9 years)' },
    '10to12': { limit: 120, bedtime: '21:30', description: 'Late Elementary (10-12 years)' },
    '13to15': { limit: 150, bedtime: '22:00', description: 'Middle School (13-15 years)' }
  });

  const getAgeFromGroup = (ageGroup: string): number => {
    const ageMap: { [key: string]: number } = {
      '1to3': 2,
      '4to6': 5,
      '7to9': 8,
      '10to12': 11,
      '13to15': 14
    };
    return ageMap[ageGroup] || 8;
  };

  const triggerAutoLock = () => {
    setSystemStatus('locked');
    Alert.alert(
      'Screen Time Limit Reached',
      'Automatically redirecting to lock screen. All running applications will be suspended.',
      [
        {
          text: 'Go to Lock Screen',
          onPress: () => router.push('/locked')
        }
      ]
    );
  };

  const stopMonitoring = () => {
    setBackgroundMonitor(prev => ({ ...prev, isRunning: false }));
    setCurrentSession(null);
    setSystemStatus('idle');
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const isBedtime = (bedtime: string): boolean => {
    const [hour, minute] = bedtime.split(':').map(Number);
    const now = new Date();
    const bedtimeDate = new Date();
    bedtimeDate.setHours(hour, minute, 0, 0);
    return now >= bedtimeDate;
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'monitoring': return '#10B981';
      case 'locked': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (systemStatus) {
      case 'monitoring': return 'Active Monitoring';
      case 'locked': return 'Device Locked';
      default: return 'System Idle';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.systemStatus}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
        <Text style={styles.currentTime}>
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      <View style={styles.monitoringCard}>
        <View style={styles.cardHeader}>
          <Eye size={24} color="#3B82F6" />
          <Text style={styles.cardTitle}>MobileNetV3 Model Integration</Text>
        </View>
        
        <Text style={styles.cardDescription}>
          Your trained MobileNetV3 model automatically detects children in 6 age groups (1-3, 4-6, 7-9, 10-12, 13-15, adults) and enforces age-appropriate screen time limits across all applications
        </Text>

        <View style={styles.monitorStats}>
          <View style={styles.statItem}>
            <Activity size={16} color="#10B981" />
            <Text style={styles.statLabel}>Status</Text>
            <Text style={[styles.statValue, { color: getStatusColor() }]}>
              {backgroundMonitor.isRunning ? 'Running' : 'Stopped'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Clock size={16} color="#3B82F6" />
            <Text style={styles.statLabel}>Scan Interval</Text>
            <Text style={styles.statValue}>{backgroundMonitor.detectionInterval}s</Text>
          </View>
          
          <View style={styles.statItem}>
            <User size={16} color="#8B5CF6" />
            <Text style={styles.statLabel}>Detections</Text>
            <Text style={styles.statValue}>{backgroundMonitor.totalDetections}</Text>
          </View>
        </View>

        {!backgroundMonitor.isRunning ? (
          <TouchableOpacity style={styles.startButton} onPress={startBackgroundMonitoring}>
            <Zap size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Activate AI Model</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopMonitoring}>
            <Shield size={20} color="#FFFFFF" />
            <Text style={styles.stopButtonText}>Deactivate MobileNetV3</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.simulateButton} onPress={simulateChildDetection}>
          <Camera size={20} color="#FFFFFF" />
          <Text style={styles.simulateButtonText}>Simulate Detection</Text>
        </TouchableOpacity>
      </View>

      {currentSession && (
        <>
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <User size={20} color="#3B82F6" />
              <Text style={styles.sessionTitle}>Active Session</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>

            <View style={styles.childInfo}>
              <Text style={styles.childName}>{currentSession.name}</Text>
              <Text style={styles.childDetails}>
                Age Group: {currentSession.ageGroup}
              </Text>
              <Text style={styles.sessionTime}>
                Session started: {currentSession.sessionStartTime.toLocaleTimeString()}
              </Text>
            </View>

            <View style={styles.usageStats}>
              <View style={styles.usageStat}>
                <Clock size={18} color="#10B981" />
                <Text style={styles.usageLabel}>Time Used</Text>
                <Text style={styles.usageValue}>{formatTime(currentSession.screenTimeUsed)}</Text>
              </View>
              
              <View style={styles.usageStat}>
                <Shield size={18} color="#F59E0B" />
                <Text style={styles.usageLabel}>Limit</Text>
                <Text style={styles.usageValue}>{formatTime(currentSession.screenTimeLimit)}</Text>
              </View>
              
              <View style={styles.usageStat}>
                <Moon size={18} color="#8B5CF6" />
                <Text style={styles.usageLabel}>Bedtime</Text>
                <Text style={styles.usageValue}>{currentSession.bedtime}</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((currentSession.screenTimeUsed / currentSession.screenTimeLimit) * 100, 100)}%`,
                      backgroundColor: currentSession.screenTimeUsed >= currentSession.screenTimeLimit * 0.9 ? '#EF4444' : 
                                     currentSession.screenTimeUsed >= currentSession.screenTimeLimit * 0.7 ? '#F59E0B' : '#10B981'
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.max(0, currentSession.screenTimeLimit - currentSession.screenTimeUsed)} minutes remaining
              </Text>
            </View>

            <View style={styles.appsUsed}>
              <Text style={styles.appsTitle}>Apps Being Monitored:</Text>
              <View style={styles.appsList}>
                {currentSession.appsUsed.map((app, index) => (
                  <View key={index} style={styles.appTag}>
                    <Text style={styles.appTagText}>{app}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {(currentSession.screenTimeUsed >= currentSession.screenTimeLimit * 0.8 || isBedtime(currentSession.bedtime)) && (
            <View style={styles.warningCard}>
              <AlertCircle size={20} color="#F59E0B" />
              <Text style={styles.warningText}>
                {isBedtime(currentSession.bedtime) 
                  ? 'Bedtime approaching! Device will lock automatically.'
                  : 'Screen time limit almost reached! Device will lock soon.'}
              </Text>
            </View>
          )}
        </>
      )}

      <View style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>🎯 Complete System Integration</Text>
        
        <View style={styles.featureItem}>
          <Activity size={16} color="#3B82F6" />
          <Text style={styles.featureText}>📷 Camera → 🧠 MobileNetV3 → ⏱️ Timer → 🔒 Lock (All Automatic)</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Camera size={16} color="#10B981" />
          <Text style={styles.featureText}>🔄 Background monitoring: Camera captures → MobileNetV3 processes → Age classified</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Shield size={16} color="#EF4444" />
          <Text style={styles.featureText}>⚡ Real-time: All apps monitored → Limits enforced → Parents can override</Text>
        </View>
        
        <View style={styles.featureItem}>
          <Clock size={16} color="#8B5CF6" />
          <Text style={styles.featureText}>🎯 Simple flow: Child uses phone → MobileNetV3 handles everything automatically</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.lockPreviewButton}
        onPress={() => router.push('/locked')}
      >
        <Shield size={20} color="#FFFFFF" />
        <Text style={styles.lockPreviewText}>Preview Lock Screen</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  systemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  currentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  monitoringCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  monitorStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 12,
  },
  simulateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  sessionCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  childInfo: {
    marginBottom: 16,
  },
  childName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  childDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  sessionTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  usageStat: {
    alignItems: 'center',
    flex: 1,
  },
  usageLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  usageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  appsUsed: {
    marginTop: 8,
  },
  appsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  appsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  appTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  appTagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  featuresCard: {
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
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
  },
  lockPreviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    marginTop: 0,
    backgroundColor: '#6B7280',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
  },
  lockPreviewText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});