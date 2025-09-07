import * as faceapi from 'face-api.js';

const DEFAULT_MODELS = 'https://cdn.jsdelivr.net/npm/face-api.js/models';

export async function loadFaceModels(baseUrl: string = DEFAULT_MODELS) {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(baseUrl),
    faceapi.nets.faceLandmark68Net.loadFromUri(baseUrl),
    faceapi.nets.faceRecognitionNet.loadFromUri(baseUrl),
    faceapi.nets.faceExpressionNet.loadFromUri(baseUrl),
  ]);
}

export async function detectFaces(input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
  return faceapi.detectAllFaces(input, options).withFaceLandmarks().withFaceExpressions();
}
