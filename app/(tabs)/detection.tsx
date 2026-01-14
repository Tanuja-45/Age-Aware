import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { Camera, Scan, CircleCheck as CheckCircle, CircleAlert as AlertCircle, RefreshCw, Eye, Users, Clock, Zap, Activity } from 'lucide-react-native';

interface DetectionResult {
  age: number;
  confidence: number;
  ageGroup: string;
  screenTimeLimit: number;
  bedtime: string;
  name: string;
}

interface BackgroundDetection {
  isActive: boolean;
  detectionCount: number;
  lastDetection: Date | null;
  averageConfidence: number;
}

export default function DetectionScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [scanAnimation] = useState(new Animated.Value(0));
  const [modelLoaded, setModelLoaded] = useState(false);

  const [backgroundDetection, setBackgroundDetection] = useState<BackgroundDetection>({
    isActive: false,
    detectionCount: 0,
    lastDetection: null,
    averageConfidence: 0
  });

  const ageGroupConfig = {
    '1to3': { limit: 45, bedtime: '20:00', color: '#10B981', description: 'Toddler Group' },
    '4to6': { limit: 60, bedtime: '20:30', color: '#3B82F6', description: 'Preschool Group' },
    '7to9': { limit: 90, bedtime: '21:00', color: '#8B5CF6', description: 'Early Elementary' },
    '10to12': { limit: 120, bedtime: '21:30', color: '#F59E0B', description: 'Late Elementary' },
    '13to15': { limit: 150, bedtime: '22:00', color: '#EF4444', description: 'Middle School' },
  };

  const childNames = ['Emma', 'Liam', 'Sophia', 'Noah', 'Olivia', 'Mason', 'Ava', 'Lucas'];

  useEffect(() => {
    // Mock camera permission check
    setCameraPermission(true);
    
    // Start scanning animation
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isScanning]);

  const loadMobileNetV3Model = () => {
    Alert.alert(
      'Load MobileNetV3 Model',
      'This will load your trained MobileNetV3 model for age detection. Make sure you have:\n\n• Converted your .keras model to TensorFlow.js format\n• Hosted the model files on GitHub or cloud storage\n• Updated the model URL in the code',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load Model',
          onPress: () => {
            // TODO: Replace with actual model loading
            setTimeout(() => {
              setModelLoaded(true);
              Alert.alert(
                'Model Loaded Successfully!',
                'Your MobileNetV3 model is now ready for age detection. You can start scanning for children.',
                [{ text: 'Start Detection' }]
              );
            }, 2000);
          }
        }
      ]
    );
  };

  const startAgeDetection = () => {
    if (!modelLoaded) {
      Alert.alert(
        'Model Not Loaded',
        'Please load the MobileNetV3 model first before starting detection.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsScanning(true);
    setDetectionResult(null);

    // Simulate detection process
    setTimeout(() => {
      performMockDetection();
    }, 3000);
  };

  const performMockDetection = () => {
    // Simulate your MobileNetV3 model results
    const mockResults = [
      { ageGroup: '1to3', confidence: 98.51, name: 'Emma' },
      { ageGroup: '4to6', confidence: 83.44, name: 'Liam' },
      { ageGroup: '7to9', confidence: 97.94, name: 'Sophia' },
      { ageGroup: '10to12', confidence: 96.04, name: 'Noah' },
      { ageGroup: '13to15', confidence: 90.60, name: 'Olivia' },
    ];

    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    const config = ageGroupConfig[randomResult.ageGroup as keyof typeof ageGroupConfig];

    const result: DetectionResult = {
      age: getAgeFromGroup(randomResult.ageGroup),
      confidence: randomResult.confidence,
      ageGroup: randomResult.ageGroup,
      screenTimeLimit: config.limit,
      bedtime: config.bedtime,
      name: randomResult.name,
    };

    setDetectionResult(result);
    setIsScanning(false);

    Alert.alert(
      'MobileNetV3 Detection Complete!',
      `Child Detected: ${result.name}\nAge Group: ${result.ageGroup}\nConfidence: ${result.confidence}%\nScreen Time Limit: ${formatTime(result.screenTimeLimit)}\nBedtime: ${result.bedtime}`,
      [{ text: 'Apply Settings' }]
    );
  };

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

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const resetDetection = () => {
    setDetectionResult(null);
    setIsScanning(false);
  };

  if (cameraPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <RefreshCw size={48} color="#6B7280" />
          <Text style={styles.loadingText}>Checking camera permissions...</Text>
        </View>
      </View>
    );
  }

  if (!cameraPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <AlertCircle size={48} color="#EF4444" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            This app needs camera access to detect the child's age for screen time regulation.
          </Text>
          <TouchableOpacity style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Activity size={28} color="#3B82F6" />
        <Text style={styles.headerTitle}>Age Detection System</Text>
        <Text style={styles.headerSubtitle}>MobileNetV3 model for automatic age classification</Text>
      </View>

      <View style={styles.modelSection}>
        <View style={styles.modelHeader}>
          <Zap size={20} color="#10B981" />
          <Text style={styles.modelTitle}>MobileNetV3 Model</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: modelLoaded ? '#10B981' : '#6B7280' }
          ]}>
            <Text style={styles.statusBadgeText}>
              {modelLoaded ? 'LOADED' : 'NOT LOADED'}
            </Text>
          </View>
        </View>

        <Text style={styles.modelDescription}>
          Your trained MobileNetV3 model with 6 age groups (1-3, 4-6, 7-9, 10-12, 13-15, adults) for automatic child detection and age classification
        </Text>

        <View style={styles.modelStats}>
          <View style={styles.modelStat}>
            <Text style={styles.statValue}>160x160</Text>
            <Text style={styles.statLabel}>Input Size</Text>
          </View>
          <View style={styles.modelStat}>
            <Text style={styles.statValue}>6</Text>
            <Text style={styles.statLabel}>Age Groups</Text>
          </View>
          <View style={styles.modelStat}>
            <Text style={styles.statValue}>75-80%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        {!modelLoaded ? (
          <TouchableOpacity style={styles.loadButton} onPress={loadMobileNetV3Model}>
            <Zap size={20} color="#FFFFFF" />
            <Text style={styles.loadButtonText}>Load MobileNetV3 Model</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.modelLoadedContainer}>
            <CheckCircle size={20} color="#10B981" />
            <Text style={styles.modelLoadedText}>Model Ready for Detection</Text>
          </View>
        )}
      </View>

      <View style={styles.cameraContainer}>
        <View style={styles.cameraFrame}>
          <Camera size={80} color="#6B7280" />
          {isScanning && (
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [
                    {
                      translateY: scanAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, 100],
                      }),
                    },
                  ],
                  opacity: scanAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                },
              ]}
            />
          )}
        </View>
        <Text style={styles.cameraInstructions}>
          {isScanning
            ? 'Running MobileNetV3 model for age detection...'
            : 'Point camera at a child and tap scan to detect age group'}
        </Text>
      </View>

      {detectionResult && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <CheckCircle size={24} color="#10B981" />
            <Text style={styles.resultTitle}>Detection Complete</Text>
          </View>
          
          <View style={styles.resultCard}>
            <View style={styles.resultItem}>
              <Users size={20} color="#3B82F6" />
              <View style={styles.resultContent}>
                <Text style={styles.resultLabel}>Child Name</Text>
                <Text style={styles.resultValue}>{detectionResult.name}</Text>
              </View>
            </View>

            <View style={styles.resultItem}>
              <Eye size={20} color="#8B5CF6" />
              <View style={styles.resultContent}>
                <Text style={styles.resultLabel}>Detected Age</Text>
                <Text style={styles.resultValue}>
                  {detectionResult.age} years ({detectionResult.confidence}% confidence)
                </Text>
              </View>
            </View>

            <View style={styles.resultItem}>
              <Users size={20} color={ageGroupConfig[detectionResult.ageGroup as keyof typeof ageGroupConfig].color} />
              <View style={styles.resultContent}>
                <Text style={styles.resultLabel}>Age Group</Text>
                <Text style={[
                  styles.resultValue,
                  { color: ageGroupConfig[detectionResult.ageGroup as keyof typeof ageGroupConfig].color }
                ]}>
                  {detectionResult.ageGroup} - {ageGroupConfig[detectionResult.ageGroup as keyof typeof ageGroupConfig].description}
                </Text>
              </View>
            </View>

            <View style={styles.resultItem}>
              <Clock size={20} color="#10B981" />
              <View style={styles.resultContent}>
                <Text style={styles.resultLabel}>Screen Time Limit</Text>
                <Text style={styles.resultValue}>
                  {formatTime(detectionResult.screenTimeLimit)}
                </Text>
              </View>
            </View>

            <View style={styles.resultItem}>
              <Clock size={20} color="#F59E0B" />
              <View style={styles.resultContent}>
                <Text style={styles.resultLabel}>Bedtime</Text>
                <Text style={styles.resultValue}>{detectionResult.bedtime}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!isScanning && !detectionResult && (
          <TouchableOpacity
            style={[styles.scanButton, { opacity: modelLoaded ? 1 : 0.5 }]}
            onPress={startAgeDetection}
            disabled={!modelLoaded}
          >
            <Scan size={24} color="#FFFFFF" />
            <Text style={styles.scanButtonText}>Start Age Detection</Text>
          </TouchableOpacity>
        )}

        {isScanning && (
          <View style={styles.scanningIndicator}>
            <Animated.View
              style={[
                styles.scanningDot,
                {
                  transform: [
                    {
                      scale: scanAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.5],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Text style={styles.scanningText}>Scanning... Please wait</Text>
          </View>
        )}

        {detectionResult && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetDetection}
          >
            <RefreshCw size={24} color="#6B7280" />
            <Text style={styles.resetButtonText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Age Group Guidelines</Text>
        {Object.entries(ageGroupConfig).map(([group, config]) => (
          <View key={group} style={styles.infoItem}>
            <View style={[styles.infoIndicator, { backgroundColor: config.color }]} />
            <Text style={styles.infoText}>
              {group} years: {formatTime(config.limit)} screen time, bedtime at {config.bedtime}
            </Text>
          </View>
        ))}
      </View>
    </View>
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
  modelSection: {
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
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modelDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  modelStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modelStat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  loadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
  },
  loadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modelLoadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    borderRadius: 8,
  },
  modelLoadedText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  cameraContainer: {
    alignItems: 'center',
    padding: 20,
  },
  cameraFrame: {
    width: 160,
    height: 160,
    borderWidth: 3,
    borderColor: '#3B82F6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    position: 'relative',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#3B82F6',
  },
  cameraInstructions: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 10,
  },
  resultContainer: {
    margin: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultContent: {
    marginLeft: 16,
    flex: 1,
  },
  resultLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    marginTop: 2,
  },
  buttonContainer: {
    alignItems: 'center',
    padding: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scanningIndicator: {
    alignItems: 'center',
  },
  scanningDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    marginBottom: 8,
  },
  scanningText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
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
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
});