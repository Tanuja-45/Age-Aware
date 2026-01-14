import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';


// import '@tensorflow/tfjs-platform-react-native';

interface ModelPrediction {
  ageGroup: string;
  confidence: number;
  isChild: boolean;
  screenTimeLimit: number;
  bedtime: string;
}

interface CameraFrame {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

class AgeDetectionService {
  private model: tf.LayersModel | null = null;
  private modelLoaded: boolean = false;
  private isProcessing: boolean = false;

  // Your model's label mapping
  private labelMap = {
    0: "1to3",
    1: "4to6", 
    2: "7to9",
    3: "10to12",
    4: "13to15",
    5: "adults"
  };

  // Age group configurations based on your model
  private ageGroupConfig = {
    '1to3': { 
      limit: 45, 
      bedtime: '20:00', 
      description: 'Toddler Group (1-3 years)',
      isChild: true 
    },
    '4to6': { 
      limit: 60, 
      bedtime: '20:30', 
      description: 'Preschool Group (4-6 years)',
      isChild: true 
    },
    '7to9': { 
      limit: 90, 
      bedtime: '21:00', 
      description: 'Early Elementary (7-9 years)',
      isChild: true 
    },
    '10to12': { 
      limit: 120, 
      bedtime: '21:30', 
      description: 'Late Elementary (10-12 years)',
      isChild: true 
    },
    '13to15': { 
      limit: 150, 
      bedtime: '22:00', 
      description: 'Middle School (13-15 years)',
      isChild: true 
    },
    'adults': { 
      limit: 0, 
      bedtime: '00:00', 
      description: 'Adult (16+ years)',
      isChild: false 
    }
  };

  constructor() {
    this.initializeTensorFlow();
  }

  /**
   * Initialize TensorFlow.js for React Native
   */
  private async initializeTensorFlow(): Promise<void> {
    try {
      // Wait for tf to be ready
      await tf.ready();
      console.log('TensorFlow.js initialized successfully');
      console.log('Backend:', tf.getBackend());
    } catch (error) {
      console.error('TensorFlow.js initialization failed:', error);
    }
  }

  /**
   * Load your MobileNetV3 model
   */
  public async loadMobileNetV3Model(modelUrl: string): Promise<boolean> {
    try {
      console.log('Loading your MobileNetV3 model from:', modelUrl);
      
      // Load your trained model
      this.model = await tf.loadLayersModel(modelUrl);
      this.modelLoaded = true;
      
      console.log('✅ Your MobileNetV3 model loaded successfully!');
      console.log('Model input shape:', this.model.inputs[0].shape);
      console.log('Model output shape:', this.model.outputs[0].shape);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load your MobileNetV3 model:', error);
      this.modelLoaded = false;
      return false;
    }
  }

  /**
   * Preprocess image for your MobileNetV3 model (160x160 input)
   */
  private async preprocessImageForMobileNetV3(imageUri: string): Promise<tf.Tensor4D | null> {
    try {
      console.log('Preprocessing image for MobileNetV3...');
      
      // Load image as tensor
      const response = await fetch(imageUri);
      const imageData = await response.arrayBuffer();
      const imageTensor = tf.node.decodeImage(new Uint8Array(imageData), 3);
      
      // Resize to 160x160 (your model's input size)
      const resized = tf.image.resizeBilinear(imageTensor, [160, 160]);
      
      // Add batch dimension
      const batched = resized.expandDims(0);
      
      // MobileNetV3 preprocessing: normalize to [-1, 1]
      const preprocessed = tf.div(tf.sub(batched, 127.5), 127.5);
      
      // Clean up intermediate tensors
      imageTensor.dispose();
      resized.dispose();
      batched.dispose();
      
      return preprocessed as tf.Tensor4D;
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      return null;
    }
  }

  /**
   * Run inference with your MobileNetV3 model
   */
  private async runMobileNetV3Inference(preprocessedImage: tf.Tensor4D): Promise<ModelPrediction | null> {
    try {
      if (!this.model || !this.modelLoaded) {
        throw new Error('MobileNetV3 model not loaded');
      }

      console.log('Running MobileNetV3 inference...');
      
      // Run prediction
      const predictions = this.model.predict(preprocessedImage) as tf.Tensor;
      const predictionData = await predictions.data();
      
      // Get the predicted class and confidence
      const predictedIndex = predictions.argMax(-1).dataSync()[0];
      const confidence = Math.max(...Array.from(predictionData)) * 100;
      
      // Map to your age group
      const ageGroup = this.labelMap[predictedIndex as keyof typeof this.labelMap];
      const config = this.ageGroupConfig[ageGroup as keyof typeof this.ageGroupConfig];
      
      console.log(`MobileNetV3 Prediction: ${ageGroup} (${confidence.toFixed(2)}%)`);
      
      // Clean up tensors
      predictions.dispose();
      preprocessedImage.dispose();
      
      return {
        ageGroup,
        confidence,
        isChild: config.isChild,
        screenTimeLimit: config.limit,
        bedtime: config.bedtime
      };
      
    } catch (error) {
      console.error('MobileNetV3 inference failed:', error);
      return null;
    }
  }

  /**
   * Main detection method using your MobileNetV3 model
   */
  public async detectAgeWithMobileNetV3(frame: CameraFrame): Promise<ModelPrediction | null> {
    if (this.isProcessing) {
      console.log('Detection in progress, skipping');
      return null;
    }

    if (!this.modelLoaded || !this.model) {
      console.error('MobileNetV3 model not loaded yet');
      return null;
    }

    this.isProcessing = true;

    try {
      // Step 1: Preprocess image for your MobileNetV3 model
      const preprocessed = await this.preprocessImageForMobileNetV3(frame.uri);
      if (!preprocessed) {
        return null;
      }

      // Step 2: Run your MobileNetV3 model
      const prediction = await this.runMobileNetV3Inference(preprocessed);
      if (!prediction) {
        return null;
      }

      // Step 3: Filter adults (ignore if not a child)
      if (!prediction.isChild) {
        console.log(`Adult detected (${prediction.ageGroup}), ignoring`);
        return null;
      }

      // Step 4: Check confidence threshold
      if (prediction.confidence < 75) {
        console.log(`Confidence ${prediction.confidence.toFixed(2)}% below threshold, ignoring`);
        return null;
      }

      console.log(`✅ Child detected: ${prediction.ageGroup}, Confidence: ${prediction.confidence.toFixed(2)}%`);
      return prediction;

    } catch (error) {
      console.error('Age detection with MobileNetV3 failed:', error);
      return null;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Check if model is ready
   */
  public isModelReady(): boolean {
    return this.modelLoaded && this.model !== null;
  }

  /**
   * Get model information
   */
  public getModelInfo(): { 
    name: string; 
    inputSize: string; 
    classes: number; 
    status: string; 
    ready: boolean 
  } {
    return {
      name: 'MobileNetV3Large',
      inputSize: '160x160',
      classes: 6,
      status: this.modelLoaded ? 'Loaded' : 'Not Loaded',
      ready: this.modelLoaded
    };
  }

  /**
   * Get age group configuration
   */
  public getAgeGroupConfig() {
    return this.ageGroupConfig;
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.modelLoaded = false;
    console.log('MobileNetV3 model disposed');
  }
}

// Export singleton instance
export const ageDetectionService = new AgeDetectionService();
export default AgeDetectionService;