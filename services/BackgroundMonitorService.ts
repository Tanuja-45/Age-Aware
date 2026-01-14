import { ageDetectionService } from './AgeDetectionService';
import { cameraService } from './CameraService';

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
  confidence: number;
}

interface MonitoringConfig {
  detectionInterval: number; // milliseconds
  confidenceThreshold: number; // minimum confidence to accept detection
  sessionTimeout: number; // milliseconds before ending session
}

class BackgroundMonitorService {
  private isMonitoring: boolean = false;
  private currentSession: ChildSession | null = null;
  private config: MonitoringConfig = {
    detectionInterval: 30000, // 30 seconds
    confidenceThreshold: 75, // 75% minimum confidence
    sessionTimeout: 300000, // 5 minutes without detection
  };
  private sessionTimer: NodeJS.Timeout | null = null;
  private onSessionUpdate?: (session: ChildSession | null) => void;
  private onLockRequired?: (reason: 'screen-time' | 'bedtime') => void;

  /**
   * Start background monitoring system
   */
  public async startMonitoring(
    onSessionUpdate: (session: ChildSession | null) => void,
    onLockRequired: (reason: 'screen-time' | 'bedtime') => void
  ): Promise<boolean> {
    try {
      if (this.isMonitoring) {
        console.log('Background monitoring already active');
        return true;
      }

      // Initialize camera
      const cameraReady = await cameraService.initializeCamera();
      if (!cameraReady) {
        console.error('Camera initialization failed');
        return false;
      }

      // Check if AI model is ready
      if (!ageDetectionService.isModelReady()) {
        console.error('AI model not ready');
        return false;
      }

      this.onSessionUpdate = onSessionUpdate;
      this.onLockRequired = onLockRequired;
      this.isMonitoring = true;

      // Start continuous camera capture and detection
      cameraService.startContinuousCapture(
        this.handleFrameCapture.bind(this),
        this.config.detectionInterval
      );

      // Start session monitoring timer
      this.startSessionTimer();

      console.log('Background monitoring started successfully');
      return true;

    } catch (error) {
      console.error('Failed to start background monitoring:', error);
      return false;
    }
  }

  /**
   * Stop background monitoring
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    
    // Stop camera capture
    cameraService.stopContinuousCapture();
    
    // Clear session timer
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }

    // End current session
    this.endCurrentSession();

    console.log('Background monitoring stopped');
  }

  /**
   * Handle captured frame from camera
   */
  private async handleFrameCapture(frame: any): Promise<void> {
    try {
      if (!this.isMonitoring) return;

      console.log('Processing captured frame for age detection...');

      // Run age detection on the frame
      const detection = await ageDetectionService.detectAge(frame);
      
      if (!detection) {
        console.log('No valid child detection in frame');
        return;
      }

      // Check confidence threshold
      if (detection.confidence < this.config.confidenceThreshold) {
        console.log(`Detection confidence ${detection.confidence}% below threshold ${this.config.confidenceThreshold}%`);
        return;
      }

      console.log(`Child detected: Age ${detection.age}, Confidence ${detection.confidence}%`);

      // Start or update session
      this.handleChildDetection(detection);

    } catch (error) {
      console.error('Frame processing failed:', error);
    }
  }

  /**
   * Handle successful child detection
   */
  private handleChildDetection(detection: any): void {
    const now = new Date();

    // If no current session or different age group detected
    if (!this.currentSession || this.currentSession.ageGroup !== detection.ageGroup) {
      this.startNewSession(detection, now);
    } else {
      // Update existing session
      this.currentSession.lastDetected = now;
      this.currentSession.confidence = detection.confidence;
    }

    // Notify UI of session update
    if (this.onSessionUpdate) {
      this.onSessionUpdate(this.currentSession);
    }
  }

  /**
   * Start new child session
   */
  private startNewSession(detection: any, startTime: Date): void {
    // Generate child names (in real app, you might have a database)
    const childNames = ['Emma', 'Liam', 'Sophia', 'Noah', 'Olivia', 'Mason'];
    const randomName = childNames[Math.floor(Math.random() * childNames.length)];

    this.currentSession = {
      id: `session-${Date.now()}`,
      name: randomName,
      age: this.getAgeFromGroup(detection.ageGroup),
      ageGroup: detection.ageGroup,
      sessionStartTime: startTime,
      screenTimeUsed: 0,
      screenTimeLimit: detection.screenTimeLimit,
      bedtime: detection.bedtime,
      isActive: true,
      lastDetected: startTime,
      confidence: detection.confidence,
    };

    console.log(`New session started for ${randomName} (${detection.ageGroup})`);
  }

  /**
   * Get representative age from age group
   */
  private getAgeFromGroup(ageGroup: string): number {
    const ageMap: { [key: string]: number } = {
      '1to3': 2,
      '4to6': 5,
      '7to9': 8,
      '10to12': 11,
      '13to15': 14
    };
    return ageMap[ageGroup] || 8;
  }

  /**
   * Session monitoring timer - tracks time and enforces limits
   */
  private startSessionTimer(): void {
    this.sessionTimer = setInterval(() => {
      if (!this.currentSession || !this.isMonitoring) return;

      const now = new Date();
      
      // Update screen time used
      const sessionDuration = Math.floor((now.getTime() - this.currentSession.sessionStartTime.getTime()) / 1000 / 60);
      this.currentSession.screenTimeUsed = sessionDuration;

      // Check if session should timeout (no detection for a while)
      const timeSinceLastDetection = now.getTime() - this.currentSession.lastDetected.getTime();
      if (timeSinceLastDetection > this.config.sessionTimeout) {
        console.log('Session timeout - no child detected recently');
        this.endCurrentSession();
        return;
      }

      // Check screen time limit
      if (this.currentSession.screenTimeUsed >= this.currentSession.screenTimeLimit) {
        console.log('Screen time limit exceeded');
        if (this.onLockRequired) {
          this.onLockRequired('screen-time');
        }
        return;
      }

      // Check bedtime
      if (this.isBedtime(this.currentSession.bedtime)) {
        console.log('Bedtime reached');
        if (this.onLockRequired) {
          this.onLockRequired('bedtime');
        }
        return;
      }

      // Update UI
      if (this.onSessionUpdate) {
        this.onSessionUpdate(this.currentSession);
      }

    }, 60000); // Check every minute
  }

  /**
   * Check if it's bedtime
   */
  private isBedtime(bedtime: string): boolean {
    const [hour, minute] = bedtime.split(':').map(Number);
    const now = new Date();
    const bedtimeDate = new Date();
    bedtimeDate.setHours(hour, minute, 0, 0);
    return now >= bedtimeDate;
  }

  /**
   * End current session
   */
  private endCurrentSession(): void {
    if (this.currentSession) {
      console.log(`Ending session for ${this.currentSession.name}`);
      this.currentSession.isActive = false;
      this.currentSession = null;
      
      if (this.onSessionUpdate) {
        this.onSessionUpdate(null);
      }
    }
  }

  /**
   * Get current session info
   */
  public getCurrentSession(): ChildSession | null {
    return this.currentSession;
  }

  /**
   * Check if monitoring is active
   */
  public isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Update monitoring configuration
   */
  public updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Monitoring config updated:', this.config);
  }

  /**
   * Get monitoring statistics
   */
  public getStats(): any {
    return {
      isMonitoring: this.isMonitoring,
      currentSession: this.currentSession,
      config: this.config,
      modelInfo: ageDetectionService.getModelInfo(),
    };
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.stopMonitoring();
    cameraService.dispose();
    ageDetectionService.dispose();
  }
}

// Export singleton instance
export const backgroundMonitorService = new BackgroundMonitorService();
export default BackgroundMonitorService;