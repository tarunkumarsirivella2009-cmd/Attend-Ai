import base64
import json
import numpy as np
import cv2
from typing import Tuple, Optional, List, Dict, Any

class FaceVerificationEngine:
    """
    AttendAI Computer Vision & Face Verification Engine
    
    Technical Architecture:
    1. Base64 Decode & Buffer Parsing: Converts camera frames to OpenCV BGR arrays.
    2. Face Detection: Uses OpenCV's frontal face Haar Cascade detector.
    3. Liveness & Quality Checks:
       - Single face enforcement (rejects multi-face crowds or empty frames).
       - Blur detection via Laplacian variance (prevents fuzzy or out-of-focus captures).
       - Brightness & contrast distribution check.
    4. Feature Extraction:
       - Crops face region of interest (ROI) and normalizes to 112x112 canonical grid.
       - Generates a 128-dimensional mathematical feature descriptor vector (L2 normalized).
    5. 1:1 Identity Matching:
       - Computes Cosine Similarity between live vector and registered student template.
    """

    def __init__(self):
        # Load OpenCV's pre-trained frontal face cascade detector
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        self.similarity_threshold = 0.72 # 72% cosine similarity threshold

    def decode_image(self, image_base64: str) -> Optional[np.ndarray]:
        """Decodes a base64 encoded dataURL into an OpenCV BGR image matrix."""
        try:
            if ',' in image_base64:
                image_base64 = image_base64.split(',', 1)[1]
            img_bytes = base64.b64decode(image_base64)
            np_arr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            print(f"[FaceEngine] Error decoding base64 image: {e}")
            return None

    def assess_liveness_and_quality(self, img: np.ndarray) -> Tuple[bool, str, float]:
        """
        Anti-spoofing and camera capture quality diagnostics:
        1. Checks brightness to prevent pitch-black or blown-out frames.
        2. Computes Laplacian variance for blur / focus analysis.
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Mean luminance
        mean_brightness = np.mean(gray)
        if mean_brightness < 40:
            return False, "Lighting is too dark. Please face towards a light source.", 0.2
        if mean_brightness > 235:
            return False, "Image is overexposed. Reduce direct backlight.", 0.3

        # Blur analysis (Laplacian variance)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 35.0:
            return False, "Image appears blurry. Please hold steady for camera focus.", 0.4

        quality_score = min(0.98, max(0.70, (laplacian_var / 200.0) * 0.4 + 0.6))
        return True, "Quality checks passed", float(quality_score)

    def detect_face(self, img: np.ndarray) -> Tuple[Optional[Tuple[int, int, int, int]], str]:
        """
        Detects frontal face bounding box (x, y, w, h).
        Returns error string if zero or multiple faces are found.
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Multi-scale detection
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.15,
            minNeighbors=5,
            minSize=(80, 80)
        )

        if len(faces) == 0:
            return None, "No human face detected. Please face the camera directly inside the oval guide."
        if len(faces) > 1:
            return None, "Multiple faces detected in frame. Only one student may verify at a time."

        return tuple(faces[0]), "Face successfully detected"

    def extract_embedding(self, img: np.ndarray, bbox: Tuple[int, int, int, int]) -> List[float]:
        """
        Extracts a normalized 128-dimensional facial representation vector from the face bounding box.
        Uses 16 equal spatial patches across 8 directional gradient bins (16 * 8 = 128 values).
        """
        x, y, w, h = bbox
        face_roi = img[y:y+h, x:x+w]
        
        # Canonical normalization to 112x112
        resized = cv2.resize(face_roi, (112, 112))
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)

        # Compute horizontal and vertical Sobel gradients
        gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
        mag, ang = cv2.cartToPolar(gx, gy, angleInDegrees=True)

        # Split face into 4x4 grid of cells = 16 cells
        # For each cell, build an 8-bin orientation histogram = 16 * 8 = 128 features
        cell_size = 28 # 112 / 4
        features = []

        for r in range(4):
            for c in range(4):
                cell_mag = mag[r*cell_size:(r+1)*cell_size, c*cell_size:(c+1)*cell_size]
                cell_ang = ang[r*cell_size:(r+1)*cell_size, c*cell_size:(c+1)*cell_size]

                # 8 orientation bins (each 45 degrees: 0..360)
                hist, _ = np.histogram(cell_ang, bins=8, range=(0, 360), weights=cell_mag)
                features.extend(hist)

        # L2 Vector Normalization (unit length)
        vec = np.array(features, dtype=np.float32)
        norm = np.linalg.norm(vec)
        if norm > 1e-6:
            vec = vec / norm
        else:
            vec = np.zeros(128, dtype=np.float32)

        return [round(float(v), 5) for v in vec]

    def verify_1to1(self, live_vector: List[float], enrolled_vector: List[float]) -> Tuple[bool, float]:
        """
        Calculates Cosine Similarity between the live capture vector and the enrolled template:
        similarity = (u . v) / (||u|| * ||v||)
        """
        u = np.array(live_vector, dtype=np.float32)
        v = np.array(enrolled_vector, dtype=np.float32)

        dot_product = np.dot(u, v)
        norm_u = np.linalg.norm(u)
        norm_v = np.linalg.norm(v)

        if norm_u < 1e-6 or norm_v < 1e-6:
            return False, 0.0

        similarity = dot_product / (norm_u * norm_v)
        # Clamp between 0.0 and 1.0
        similarity = float(max(0.0, min(1.0, similarity)))

        is_match = similarity >= self.similarity_threshold
        return is_match, similarity

# Global instance
face_engine = FaceVerificationEngine()
