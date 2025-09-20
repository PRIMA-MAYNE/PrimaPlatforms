// lib/face-api.ts — Real face recognition using face-api.js

import * as faceapi from 'face-api.js';

// ========================
// INTERNAL STATE
// ========================

let modelsLoaded = false;
const studentEmbeddingCache = new Map<string, Float32Array>();

// ========================
// MODEL LOADING
// ========================

export const initializeFaceApi = async (): Promise<boolean> => {
  if (modelsLoaded) return true;

  try {
    // Load models from CDN with correct syntax
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.load({
        modelUri: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/weights/'
      }),
      faceapi.nets.faceRecognitionNet.load({
        modelUri: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/weights/'
      }),
      faceapi.nets.faceLandmark68Net.load({
        modelUri: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/weights/'
      })
    ]);

    modelsLoaded = true;
    return true;
  } catch (error) {
    console.error('Failed to load face-api.js models:', error);
    return false;
  }
};

export const ensureFaceApiReady = async (): Promise<void> => {
  if (!modelsLoaded) {
    const success = await initializeFaceApi();
    if (!success) {
      throw new Error('face-api.js failed to initialize.');
    }
  }
};

// ========================
// FACE DETECTION
// ========================

interface FaceDetectionResult {
  detection: faceapi.FaceDetection;
  isValid: boolean;
}

export const detectFaces = async (
  element: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<FaceDetectionResult[]> => {
  await ensureFaceApiReady();

  const detections = await faceapi.detectAllFaces(
    element,
    new faceapi.SsdMobilenetv1Options({ minConfidence: 0.7 })
  );

  return detections.map(detection => ({
    detection,
    isValid: detection.box.width > 50 && detection.box.height > 50
  })).filter(r => r.isValid);
};

// ========================
// FACE CROP (same logic)
// ========================

export const extractFaceCrop = (
  element: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
  bbox: { x: number; y: number; width: number; height: number }
): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const size = Math.max(bbox.width, bbox.height) * 1.2;
  const x = Math.max(0, bbox.x - (size - bbox.width) / 2);
  const y = Math.max(0, bbox.y - (size - bbox.height) / 2);

  canvas.width = 192;
  canvas.height = 192;
  ctx.drawImage(
    element,
    x, y, size, size,
    0, 0, 192, 192
  );

  return canvas.toDataURL('image/png', 0.9);
};

// ========================
// FACE EMBEDDING (REAL RECOGNITION)
// ========================

export const generateFaceEmbedding = async (
  element: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<Float32Array> => {
  await ensureFaceApiReady();

  const detections = await faceapi
    .detectAllFaces(element)
    .withFaceLandmarks()
    .withFaceDescriptors(); // ← 128-dim embedding

  if (detections.length === 0) {
    throw new Error('No face detected');
  }

  // Use highest confidence face
  const best = detections.reduce((prev, curr) =>
    prev.detection.score > curr.detection.score ? prev : curr
  );

  return best.descriptor; // ✅ Real face embedding
};

export const getOrGenerateEmbedding = async (
  studentId: string,
  imageBase64: string
): Promise<Float32Array> => {
  if (studentEmbeddingCache.has(studentId)) {
    return studentEmbeddingCache.get(studentId)!;
  }

  const img = new Image();
  img.src = imageBase64;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Image failed to load'));
  });

  const embedding = await generateFaceEmbedding(img);
  studentEmbeddingCache.set(studentId, embedding);
  return embedding;
};

// ========================
// FACE MATCHING (REAL)
// ========================

export const cosineSimilarity = (a: Float32Array, b: Float32Array): number => {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
};

export const matchFaceToStudents = (
  liveEmbedding: Float32Array,
  enrolledStudents: { id: string; faceEmbedding: Float32Array }[]
): string[] => {
  const matches: string[] = [];

  for (const student of enrolledStudents) {
    const similarity = cosineSimilarity(liveEmbedding, student.faceEmbedding);
    if (similarity >= 0.6) { // Good threshold for real-world use
      matches.push(student.id);
    }
  }

  return matches;
};

export const matchLiveFrame = async (
  videoElement: HTMLVideoElement,
  enrolledStudents: { id: string; faceEmbedding: Float32Array }[]
): Promise<string[]> => {
  await ensureFaceApiReady();

  const detections = await faceapi
    .detectAllFaces(videoElement)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (detections.length === 0) return [];

  const matchedIds = new Set<string>();
  for (const detection of detections) {
    const matches = matchFaceToStudents(detection.descriptor, enrolledStudents);
    matches.forEach(id => matchedIds.add(id));
  }

  return Array.from(matchedIds);
};

// ========================
// CLEANUP
// ========================

export const clearEmbeddingCache = () => {
  studentEmbeddingCache.clear();
};

export const resetFaceApi = () => {
  modelsLoaded = false;
  clearEmbeddingCache();
};