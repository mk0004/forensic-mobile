export const DEEPFACE_API_BASE_URL = 'https://anastamer-deepface-project.hf.space';

export const DEEPFACE_ENDPOINTS = {
  recognize: '/recognize',
  deepfake: '/deepFake',
  forensicAnalysis: '/forensicAnalysis',
  dnaPhenotyping: '/dnaPhenotyping',
} as const;

export const DEFAULT_DETECTOR_BACKEND = 'retinaface';
export const DEFAULT_FACE_MODEL = 'ArcFace';
export const DEFAULT_DNA_PANEL = 'all';
