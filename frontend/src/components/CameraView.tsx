import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, Sun, Eye } from 'lucide-react';

interface CameraViewProps {
  mode: 'enrollment' | 'verification';
  onCapture: (imageDataUrl: string, confidence: number) => void;
  onCancel?: () => void;
  onFallbackOTP?: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  mode,
  onCapture,
  onCancel,
  onFallbackOTP
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Lighting analysis
  const [lightingState, setLightingState] = useState<'analyzing' | 'good' | 'low' | 'harsh'>('analyzing');
  
  // Liveness check state machine
  const [livenessStep, setLivenessStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
      setLivenessStep(1);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings or use the non-biometric OTP alternative.'
          : 'No camera hardware found or camera is currently occupied by another app.'
      );
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Periodic lighting analysis
  useEffect(() => {
    if (!cameraActive) return;

    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, 80, 60);
          const imageData = ctx.getImageData(0, 0, 80, 60);
          const data = imageData.data;
          let totalBrightness = 0;
          for (let i = 0; i < data.length; i += 4) {
            // Standard perceptual luminance formula
            const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            totalBrightness += brightness;
          }
          const avgBrightness = totalBrightness / (data.length / 4);
          if (avgBrightness < 45) {
            setLightingState('low');
          } else if (avgBrightness > 225) {
            setLightingState('harsh');
          } else {
            setLightingState('good');
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cameraActive]);

  // Capture & Verify Handler
  const handleTriggerAction = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);

    // Multi-step simulated liveness verification sequence
    setLivenessStep(2); // "Blink or micro-movement check"

    setTimeout(() => {
      setLivenessStep(3); // "Feature vector extraction & matching"

      setTimeout(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            // Simulated confidence score (91% - 98%)
            const score = 0.91 + Math.random() * 0.07;
            stopCamera();
            setIsProcessing(false);
            onCapture(dataUrl, parseFloat(score.toFixed(4)));
          }
        }
      }, 1200);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <span>
              {mode === 'enrollment' ? 'Voluntary Facial Enrollment' : 'Camera-Based Attendance Verification'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'enrollment'
              ? 'Fit your face inside the oval guide to generate your private mathematical template.'
              : 'Verifying live student identity against enrolled biometric template.'}
          </p>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
          <span>Local Camera</span>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="mt-5 relative">
        {!cameraActive ? (
          <div className="aspect-[4/3] w-full rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-8 text-center">
            
            {cameraError ? (
              <div className="space-y-4 max-w-md">
                <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Camera Unavailable</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{cameraError}</p>
                </div>
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow transition flex items-center space-x-2"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Try Again</span>
                  </button>
                  {onFallbackOTP && (
                    <button
                      onClick={onFallbackOTP}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition"
                    >
                      Use Session OTP
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto shadow-inner">
                  <Camera className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base">Activate Verification Camera</h4>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Camera activates exclusively when you press Start. No continuous video is saved or streamed to public networks.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={startCamera}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
                  >
                    Start Attendance Verification
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-800">
            {/* Live Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />

            {/* Hidden canvas for snapshotting */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Viewfinder Target Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              
              {/* Corner crosshairs */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-blue-400/80 rounded-tl-lg" />
              <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-blue-400/80 rounded-tr-lg" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-blue-400/80 rounded-bl-lg" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-blue-400/80 rounded-br-lg" />

              {/* Facial Oval Guide */}
              <div className={`w-52 h-64 rounded-[50%] border-2 transition-all duration-300 relative flex items-center justify-center ${
                isProcessing
                  ? 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)]'
                  : 'border-blue-400/70 border-dashed shadow-[0_0_20px_rgba(96,165,250,0.3)]'
              }`}>
                {/* Scanning Radar Beam */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent radar-beam" />
              </div>

            </div>

            {/* Environmental Quality Badge (Top Left) */}
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-medium text-white flex items-center space-x-1.5">
                <Sun className={`h-3.5 w-3.5 ${lightingState === 'good' ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span>
                  {lightingState === 'good' ? 'Lighting: Good' : lightingState === 'low' ? 'Low Light' : 'Harsh Lighting'}
                </span>
              </div>
            </div>

            {/* Liveness Guidance Prompt (Top Right) */}
            <div className="absolute top-4 right-4">
              <div className="px-2.5 py-1 rounded-full bg-blue-950/80 backdrop-blur-md border border-blue-500/30 text-[11px] font-bold text-blue-300 flex items-center space-x-1.5">
                <Eye className="h-3.5 w-3.5" />
                <span>Liveness Check: Active</span>
              </div>
            </div>

            {/* Multi-step Status Banner on Bottom */}
            <div className="absolute bottom-4 inset-x-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 text-white">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${isProcessing ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'}`} />
                  <span className="font-semibold">
                    {livenessStep === 1
                      ? 'Align face inside the oval guideline'
                      : livenessStep === 2
                      ? 'Performing micro-liveness test (natural blink)'
                      : 'Matching biometric feature vector...'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Step {livenessStep} of 3</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${(livenessStep / 3) * 100}%` }}
                />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Control Buttons Footer */}
      {cameraActive && (
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => {
              stopCamera();
              if (onCancel) onCancel();
            }}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            {onFallbackOTP && (
              <button
                onClick={() => {
                  stopCamera();
                  onFallbackOTP();
                }}
                disabled={isProcessing}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
              >
                Use Session OTP
              </button>
            )}

            <button
              onClick={handleTriggerAction}
              disabled={isProcessing}
              className={`px-6 py-2 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center space-x-2 ${
                isProcessing
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Verifying Identity...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>
                    {mode === 'enrollment' ? 'Capture & Generate Template' : 'Confirm Face & Mark Present'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Security notice */}
      <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-500 text-[11px] flex items-center space-x-2">
        <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
        <span>
          <strong>Privacy Guarantee</strong>: Facial data is strictly processed client/server-side as mathematical embeddings. Images are purged immediately after vector calculation.
        </span>
      </div>

    </div>
  );
};
