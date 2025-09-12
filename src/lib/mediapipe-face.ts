// lib/mediapipe-face.ts
import * as faceDetection from '@mediapipe/face_detection';
import * as faceLandmarks from '@mediapipe/face_mesh';
import * as faceRecognition from '@mediapipe/face_recognition';

// Initialize models once
let detector: faceDetection.FaceDetection | null = null;
let recognizer: faceRecognition.FaceRecognition | null = null;

export const initializeMediaPipe = async () => {
  if (detector && recognizer) return;

  // Load models from CDN or local bundle
  detector = new faceDetection.FaceDetection({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
  });

  recognizer = new faceRecognition.FaceRecognition({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_recognition/${file}`,
  });

  await Promise.all([
    detector.load(),
    recognizer.load(),
  ]);
};

export const generateFaceEmbedding = async (
  imageElement: HTMLImageElement | HTMLVideoElement
): Promise<number[]> => {
  await initializeMediaPipe();

  if (!detector || !recognizer) {
    throw new Error('MediaPipe models not initialized');
  }

  // Step 1: Detect face
  const detections = await detector.detect(imageElement);
  if (!detections || detections.length === 0) {
    throw new Error('No face detected');
  }

  // Use first detected face
  const faceBox = detections[0].boundingBox;

  // Step 2: Generate embedding
  const embedding = await recognizer.generateEmbedding(imageElement, faceBox);

  // Return normalized 128-dim array
  return Array.from(embedding.float32Values);
};

export const compareEmbeddings = (embedding1: number[], embedding2: number[]): number => {
  if (embedding1.length !== 128 || embedding2.length !== 128) return 0;

  // Cosine similarity
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (let i = 0; i < 128; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    mag1 += embedding1[i] * embedding1[i];
    mag2 += embedding2[i] * embedding2[i];
  }

  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  return magnitude > 0 ? dotProduct / magnitude : 0;
};
