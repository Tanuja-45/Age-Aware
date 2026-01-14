import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Clock, TrendingUp, Calendar, ChartBar as BarChart3, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Moon, Zap, Activity } from 'lucide-react-native';

interface ActivityLog {
  id: string;
  date: string;
  screenTime: number;
  limit: number;
  bedtimeViolations: number;
  overageMinutes: number;
  status: 'good' | 'warning' | 'exceeded';
}

interface WeeklyStats {
  averageScreenTime: number;
  totalOverage: number;
  complianceDays: number;
  bedtimeViolations: number;
}

interface AutoDetectionLog {
  id: string;
  timestamp: Date;
  childName: string;
  age: number;
  confidence: number;
  actionTaken: string;
}

export default function ActivityScreen() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [autoDetections, setAutoDetections] = useState<AutoDetectionLog[]>([]);

  useEffect(() => {
    // Generate mock activity data
    const generateMockData = () => {
      const logs: ActivityLog[] = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const screenTime = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
        const limit = 90; // 1.5 hours for 5-8 age group
        const bedtimeViolations = Math.random() > 0.7 ? 1 : 0;
        const overageMinutes = Math.max(0, screenTime - limit);
        
        let status: 'good' | 'warning' | 'exceeded' = 'good';
        if (overageMinutes > 0) status = 'exceeded';
        else if (screenTime > limit * 0.8) status = 'warning';

        logs.push({
          id: `log-${i}`,
          date: date.toISOString().split('T')[0],
          screenTime,
          limit,
          bedtimeViolations,
          overageMinutes,
          status,
        });
      }
      
      return logs;
    };

    const logs = generateMockData();
    setActivityLogs(logs);

    // Calculate weekly stats
    const totalScreenTime = logs.reduce((sum, log) => sum + log.screenTime, 0);
    const totalOverage = logs.reduce((sum, log) => sum + log.overageMinutes, 0);
    const complianceDays = logs.filter(log => log.status === 'good').length;
    const totalBedtimeViolations = logs.reduce((sum, log) => sum + log.bedtimeViolations, 0);

    setWeeklyStats({
      averageScreenTime: Math.floor(totalScreenTime / logs.length),
      totalOverage,
      complianceDays,
      bedtimeViolations: totalBedtimeViolations,
    });

    // Generate mock auto-detection logs
    const detectionLogs: AutoDetectionLog[] = [];
    for (let i = 0; i < 5; i++) {
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - i * 2);
      
      detectionLogs.push({
        id: `detection-${i}`,
        timestamp,
        childName: 'Emma',
        age: 6,
        confidence: Math.floor(Math.random() * 15) + 85,
        actionTaken: i === 0 ? 'Session started' : 
                    i === 1 ? 'Limit enforced' : 
                    i === 2 ? 'Bedtime lock' : 'Session monitored'
      });
    }
    setAutoDetections(detectionLogs);
  }, []);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'good': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'exceeded': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle size={20} color="#10B981" />;
      case 'warning': return <AlertTriangle size={20} color="#F59E0B" />;
      case 'exceeded': return <AlertTriangle size={20} color="#EF4444" />;
      default: return <Clock size={20} color="#6B7280" />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Activity size={28} color="#3B82F6" />
        <Text style={styles.headerTitle}>Activity Monitor</Text>
        <Text style={styles.headerSubtitle}>Track screen time usage and compliance</Text>
      </View>

      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'week' && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === 'week' && styles.periodButtonTextActive
          ]}>
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'month' && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === 'month' && styles.periodButtonTextActive
          ]}>
            This Month
          </Text>
        </TouchableOpacity>
      </View>

      {weeklyStats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Clock size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{formatTime(weeklyStats.averageScreenTime)}</Text>
            <Text style={styles.statLabel}>Daily Average</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#10B981" />
            <Text style={styles.statValue}>{weeklyStats.complianceDays}/7</Text>
            <Text style={styles.statLabel}>Compliant Days</Text>
          </View>
          <View style={styles.statCard}>
            <AlertTriangle size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{formatTime(weeklyStats.totalOverage)}</Text>
            <Text style={styles.statLabel}>Total Overage</Text>
          </View>
          <View style={styles.statCard}>
            <Moon size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>{weeklyStats.bedtimeViolations}</Text>
            <Text style={styles.statLabel}>Bedtime Issues</Text>
          </View>
        </View>
      )}

      <View style={styles.autoDetectionContainer}>
        <View style={styles.sectionHeaderWithIcon}>
          <Zap size={20} color="#10B981" />
          <Text style={styles.sectionTitle}>Automatic Detections</Text>
        </View>
        {autoDetections.map((detection) => (
          <View key={detection.id} style={styles.detectionItem}>
            <View style={styles.detectionHeader}>
              <Text style={styles.detectionTime}>
                {detection.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{detection.confidence}%</Text>
              </View>
            </View>
            <Text style={styles.detectionChild}>
              {detection.childName} ({detection.age} years)
            </Text>
            <Text style={styles.detectionAction}>
              Action: {detection.actionTaken}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.logsContainer}>
        <View style={styles.sectionHeaderWithIcon}>
          <Calendar size={20} color="#3B82F6" />
        <Text style={styles.sectionTitle}>Daily Activity Log</Text>
        </View>
        {activityLogs.map((log) => (
          <View key={log.id} style={styles.logItem}>
            <View style={styles.logHeader}>
              <View style={styles.logDate}>
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.logDateText}>{formatDate(log.date)}</Text>
              </View>
              {getStatusIcon(log.status)}
            </View>
            
            <View style={styles.logContent}>
              <View style={styles.logStat}>
                <Text style={styles.logStatLabel}>Screen Time</Text>
                <Text style={[
                  styles.logStatValue,
                  { color: getStatusColor(log.status) }
                ]}>
                  {formatTime(log.screenTime)}
                </Text>
              </View>
              <View style={styles.logStat}>
                <Text style={styles.logStatLabel}>Limit</Text>
                <Text style={styles.logStatValue}>{formatTime(log.limit)}</Text>
              </View>
              {log.overageMinutes > 0 && (
                <View style={styles.logStat}>
                  <Text style={styles.logStatLabel}>Overage</Text>
                  <Text style={[styles.logStatValue, { color: '#EF4444' }]}>
                    +{formatTime(log.overageMinutes)}
                  </Text>
                </View>
              )}
              {log.bedtimeViolations > 0 && (
                <View style={styles.logStat}>
                  <Text style={styles.logStatLabel}>Bedtime Issues</Text>
                  <Text style={[styles.logStatValue, { color: '#F59E0B' }]}>
                    {log.bedtimeViolations} violation{log.bedtimeViolations > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((log.screenTime / log.limit) * 100, 100)}%`,
                    backgroundColor: getStatusColor(log.status),
                  }
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.insightsContainer}>
        <View style={styles.sectionHeaderWithIcon}>
          <TrendingUp size={20} color="#10B981" />
        <Text style={styles.sectionTitle}>Weekly Insights</Text>
        </View>
        <View style={styles.insightItem}>
          <View style={styles.insightIcon}>
            <TrendingUp size={20} color="#10B981" />
          </View>
          <Text style={styles.insightText}>
            Great job! Screen time compliance improved by 15% this week.
          </Text>
        </View>
        <View style={styles.insightItem}>
          <View style={styles.insightIcon}>
            <Clock size={20} color="#3B82F6" />
          </View>
          <Text style={styles.insightText}>
            Average daily screen time is within healthy limits for age group 5-8.
          </Text>
        </View>
        <View style={styles.insightItem}>
          <View style={styles.insightIcon}>
            <Zap size={20} color="#F59E0B" />
          </View>
          <Text style={styles.insightText}>
            Background detection system has been 95% accurate this week.
          </Text>
        </View>
        <View style={styles.insightItem}>
          <View style={styles.insightIcon}>
            <Moon size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.insightText}>
            Consider adjusting bedtime routine to improve sleep schedule consistency.
          </Text>
        </View>
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
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#3B82F6',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  logsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  autoDetectionContainer: {
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
  detectionItem: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  detectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detectionTime: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  confidenceBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  confidenceText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  detectionChild: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  detectionAction: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  logItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 6,
  },
  logContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  logStat: {
    minWidth: '30%',
    marginBottom: 4,
  },
  logStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  logStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightsContainer: {
    margin: 20,
    marginTop: 0,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
    lineHeight: 20,
  },
});