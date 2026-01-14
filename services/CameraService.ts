import { Camera } from 'expo-camera';

interface CameraFrame {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

interface CameraConfig {
  quality: number;
  base64: boolean;
  skipProcessing: boolean;
}

class CameraService {
  private camera: Camera | null = null;
  private isCapturing: boolean = false;
  private captureInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize camera with permissions
   */
  public async initializeCamera(): Promise<boolean> {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        console.error('Camera permission denied');
        return false;
      }
      
      console.log('Camera initialized successfully');
      return true;
    } catch (error) {
      console.error('Camera initialization failed:', error);
      return false;
    }
  }

  /**
   * Set camera reference
   */
  public setCameraRef(camera: Camera): void {
    this.camera = camera;
  }

  /**
   * Capture single frame from camera
   */
  public async captureFrame(config: CameraConfig = { quality: 0.7, base64: true, skipProcessing: false }): Promise<CameraFrame | null> {
    try {
      if (!this.camera) {
        console.error('Camera reference not set');
        return null;
      }

      if (this.isCapturing) {
        console.log('Capture already in progress');
        return null;
      }

      this.isCapturing = true;

      const photo = await this.camera.takePictureAsync({
        quality: config.quality,
        base64: config.base64,
        skipProcessing: config.skipProcessing,
      });

      const frame: CameraFrame = {
        uri: photo.uri,
        width: photo.width || 0,
        height: photo.height || 0,
        base64: photo.base64,
      };

      console.log(`Frame captured: ${frame.width}x${frame.height}`);
      return frame;

    } catch (error) {
      console.error('Frame capture failed:', error);
      return null;
    } finally {
      this.isCapturing = false;
    }
  }

  /**
   * Start continuous frame capture for background monitoring
   */
  public startContinuousCapture(
    onFrameCaptured: (frame: CameraFrame) => void,
    intervalMs: number = 30000 // 30 seconds default
  ): void {
    if (this.captureInterval) {
      console.log('Continuous capture already running');
      return;
    }

    console.log(`Starting continuous capture every ${intervalMs}ms`);
    
    this.captureInterval = setInterval(async () => {
      const frame = await this.captureFrame();
      if (frame) {
        onFrameCaptured(frame);
      }
    }, intervalMs);
  }

  /**
   * Stop continuous frame capture
   */
  public stopContinuousCapture(): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
      console.log('Continuous capture stopped');
    }
  }

  /**
   * Check if continuous capture is running
   */
  public isContinuousCaptureActive(): boolean {
    return this.captureInterval !== null;
  }

  /**
   * Get camera capabilities and info
   */
  public async getCameraInfo(): Promise<any> {
    try {
      if (!this.camera) {
        return null;
      }

      // Get available camera types, ratios, etc.
      const availableCameraTypes = await Camera.getAvailableCameraTypesAsync();
      
      return {
        availableTypes: availableCameraTypes,
        isRecording: false, // Add more camera info as needed
      };
    } catch (error) {
      console.error('Failed to get camera info:', error);
      return null;
    }
  }

  /**
   * Cleanup camera resources
   */
  public dispose(): void {
    this.stopContinuousCapture();
    this.camera = null;
  }
}

// Export singleton instance
export const cameraService = new CameraService();
export default CameraService;