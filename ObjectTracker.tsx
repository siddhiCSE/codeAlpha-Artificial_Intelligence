import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { 
  Camera, 
  CameraOff, 
  Tv, 
  Play, 
  Pause, 
  Activity, 
  Sparkles, 
  RefreshCw, 
  Terminal,
  Layers,
  History
} from 'lucide-react';
import { Tracker, DetectedObject } from '../types';

const COLORS = [
  '#CCFF00', // Neon Lime (Theme specific primary color)
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#eab308', // yellow-500
  '#a855f7', // purple-500
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#06b6d4', // cyan-500
];

export default function ObjectTracker() {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [loadingModel, setLoadingModel] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [activeStreamType, setActiveStreamType] = useState<'webcam' | 'simulation'>('simulation');

  // Video and Canvas Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core States
  const [isStreaming, setIsStreaming] = useState(false);
  const [trackedItems, setTrackedItems] = useState<Tracker[]>([]);
  const [systemLogs, setSystemLogs] = useState<{ id: string; time: string; text: string; type: 'info' | 'success' | 'warn' }[]>([]);

  // Simulation parameters for mock stream
  const simulationFrameRef = useRef<number | null>(null);
  const simulationObjectsRef = useRef<{
    id: number;
    label: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    w: number;
    h: number;
    color: string;
  }[]>([
    { id: 101, label: 'Person', x: 80, y: 120, vx: 1.5, vy: 0.5, w: 80, h: 180, color: COLORS[0] },
    { id: 102, label: 'Car', x: 450, y: 250, vx: -2.5, vy: 0.2, w: 140, h: 90, color: COLORS[1] },
    { id: 103, label: 'Dog', x: 200, y: 350, vx: 0.8, vy: -0.4, w: 70, h: 50, color: COLORS[2] },
    { id: 104, label: 'Bicycle', x: 300, y: 180, vx: -1.0, vy: 0.8, w: 90, h: 70, color: COLORS[3] }
  ]);

  // Object Tracking (Centroid/SORT-like Tracker variables)
  const nextTrackerIdRef = useRef<number>(1);
  const activeTrackersRef = useRef<Tracker[]>([]);
  const streamActiveRef = useRef<boolean>(false);
  const animationFrameIdRef = useRef<number | null>(null);

  // Add system logs helper
  const addLog = (text: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setSystemLogs(prev => [
      { id: Math.random().toString(), time, text, type },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  };

  // Initialize TensorFlow and load COCO-SSD model
  useEffect(() => {
    async function loadTensorFlowModel() {
      try {
        setLoadingModel(true);
        addLog('Initializing TensorFlow.js WebGL backend...', 'info');
        await tf.ready();
        
        addLog('Downloading pre-trained COCO-SSD (MobileNetV2) model...', 'info');
        const ssdModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        
        setModel(ssdModel);
        addLog('TensorFlow.js COCO-SSD model loaded successfully!', 'success');
      } catch (err: any) {
        console.error(err);
        setModelError(err.message || 'Failed to download or initialize model.');
        addLog('Error loading TF.js model. Falling back to high-fidelity canvas simulation.', 'warn');
      } finally {
        setLoadingModel(false);
      }
    }
    loadTensorFlowModel();

    return () => {
      // Clean up animations on unmount
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (simulationFrameRef.current) cancelAnimationFrame(simulationFrameRef.current);
    };
  }, []);

  // Control stream playback
  useEffect(() => {
    streamActiveRef.current = isStreaming;
    if (isStreaming) {
      if (activeStreamType === 'webcam') {
        startWebcamStream();
      } else {
        startSimulationStream();
      }
    } else {
      stopStreams();
    }
  }, [isStreaming, activeStreamType]);

  const stopStreams = () => {
    // Cancel video/canvas tracking loops
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (simulationFrameRef.current) {
      cancelAnimationFrame(simulationFrameRef.current);
      simulationFrameRef.current = null;
    }

    // Stop Webcam video capture track
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    // Clear tracked items state
    setTrackedItems([]);
    activeTrackersRef.current = [];
    addLog('Video tracking stream stopped.', 'info');
  };

  // Web Speech API / navigator device permissions
  const startWebcamStream = async () => {
    addLog('Requesting webcam device access permission...', 'info');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          addLog('Webcam connected! Launching frame detection loop...', 'success');
          // Start main detection looping
          requestAnimationFrame(detectionLoop);
        };
      }
    } catch (err: any) {
      console.error(err);
      setIsStreaming(false);
      addLog('Failed to access webcam device. Permission denied or occupied.', 'warn');
    }
  };

  // Simulated video feed generator
  const startSimulationStream = () => {
    addLog('Launching simulated CCTV camera stream...', 'success');
    addLog('Loading computer vision centroid tracker variables...', 'info');
    
    // Reset tracker list
    activeTrackersRef.current = [];
    nextTrackerIdRef.current = 1;

    const runSimulationFrame = () => {
      if (!streamActiveRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      // Ensure canvas maintains 640x480 simulation resolution
      canvas.width = 640;
      canvas.height = 480;

      // 1. Draw custom blueprint styling grid background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, 640, 480);
      
      // Draw grid lines
      ctx.strokeStyle = '#141416';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < 640; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 480);
        ctx.stroke();
      }
      for (let y = 0; y < 480; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
      }

      // Draw horizontal crosshairs indicator
      ctx.strokeStyle = '#1d1d21';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(320, 20); ctx.lineTo(320, 460);
      ctx.moveTo(20, 240); ctx.lineTo(620, 240);
      ctx.stroke();

      // 2. Compute bounce/movement physics for simulated vectors
      const currentSimObjects = simulationObjectsRef.current.map(obj => {
        let nextX = obj.x + obj.vx;
        let nextY = obj.y + obj.vy;
        let nextVx = obj.vx;
        let nextVy = obj.vy;

        // Bounce horizontally
        if (nextX <= 10 || nextX + obj.w >= 630) {
          nextVx = -obj.vx;
          nextX = obj.x + nextVx;
        }
        // Bounce vertically
        if (nextY <= 10 || nextY + obj.h >= 470) {
          nextVy = -obj.vy;
          nextY = obj.y + nextVy;
        }

        return { ...obj, x: nextX, y: nextY, vx: nextVx, vy: nextVy };
      });
      simulationObjectsRef.current = currentSimObjects;

      // 3. Assemble mock detections list
      const mockDetections: DetectedObject[] = currentSimObjects.map(obj => ({
        bbox: [obj.x, obj.y, obj.w, obj.h],
        label: obj.label,
        score: 0.85 + Math.random() * 0.12
      }));

      // 4. Feed simulated frames through tracking pipeline
      processFrameDetections(mockDetections);

      // Draw custom overlays
      drawTrackingOverlays(ctx);

      // Request next frame
      simulationFrameRef.current = requestAnimationFrame(runSimulationFrame);
    };

    simulationFrameRef.current = requestAnimationFrame(runSimulationFrame);
  };

  // Core Frame Detection Loop using actual cocoSsd model
  const detectionLoop = async () => {
    if (!streamActiveRef.current || activeStreamType !== 'webcam') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (video && canvas && ctx && model) {
      try {
        // Adjust canvas resolution dynamically
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }

        // Draw live video frames on base canvas layer
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Perform async tensor detection
        const rawDetections = await model.detect(video);
        
        // Match detections with tracking algorithm
        const formattedDetections: DetectedObject[] = rawDetections.map(det => ({
          bbox: det.bbox as [number, number, number, number],
          label: det.class,
          score: det.score
        }));

        processFrameDetections(formattedDetections);

        // Render trails and bounding coordinates overlays
        drawTrackingOverlays(ctx);

      } catch (err) {
        console.error('Frame extraction failure:', err);
      }
    }

    // Loop
    animationFrameIdRef.current = requestAnimationFrame(detectionLoop);
  };

  // Dynamic Centroid Association & SORT-like Tracker Pipeline
  const processFrameDetections = (detections: DetectedObject[]) => {
    const currentTrackers = [...activeTrackersRef.current];
    const updatedTrackers: Tracker[] = [];

    // Helper: Calculate center coordinate of bbox [x, y, w, h]
    const getCentroid = (bbox: [number, number, number, number]): [number, number] => {
      return [bbox[0] + bbox[2] / 2, bbox[1] + bbox[3] / 2];
    };

    // Keep track of which detections have been associated with a tracker
    const associatedDetectionIndexes = new Set<number>();

    // 1. Try to associate existing active trackers with current frame detections (Centroid matching)
    currentTrackers.forEach(tracker => {
      let closestDetectionIndex = -1;
      let minDistance = 95; // Association distance threshold limit in px

      detections.forEach((det, idx) => {
        if (associatedDetectionIndexes.has(idx)) return;
        if (det.label.toLowerCase() !== tracker.label.toLowerCase()) return;

        const detCentroid = getCentroid(det.bbox);
        const distance = Math.hypot(detCentroid[0] - tracker.centroid[0], detCentroid[1] - tracker.centroid[1]);

        if (distance < minDistance) {
          minDistance = distance;
          closestDetectionIndex = idx;
        }
      });

      if (closestDetectionIndex !== -1) {
        // Tracker associated! Update centroid and extend trail history
        associatedDetectionIndexes.add(closestDetectionIndex);
        const det = detections[closestDetectionIndex];
        const newCentroid = getCentroid(det.bbox);
        
        const newHistory = [...tracker.history, newCentroid];
        if (newHistory.length > 35) newHistory.shift(); // Keep trailing sequence limit

        updatedTrackers.push({
          ...tracker,
          bbox: det.bbox,
          centroid: newCentroid,
          history: newHistory,
          inactiveCount: 0
        });
      } else {
        // Tracker missed in this frame. Increment missed counter for decay
        const missedLimit = activeStreamType === 'simulation' ? 5 : 12;
        if (tracker.inactiveCount < missedLimit) {
          updatedTrackers.push({
            ...tracker,
            inactiveCount: tracker.inactiveCount + 1
          });
        } else {
          addLog(`Lost object trace ID #${tracker.id} : [${tracker.label.toUpperCase()}]`, 'warn');
        }
      }
    });

    // 2. Create brand new trackers for unassociated detections
    detections.forEach((det, idx) => {
      if (associatedDetectionIndexes.has(idx)) return;

      const newId = nextTrackerIdRef.current;
      nextTrackerIdRef.current += 1;
      const initialCentroid = getCentroid(det.bbox);
      const trackerColor = COLORS[newId % COLORS.length];

      updatedTrackers.push({
        id: newId,
        label: det.label,
        bbox: det.bbox,
        centroid: initialCentroid,
        history: [initialCentroid],
        color: trackerColor,
        inactiveCount: 0
      });

      addLog(`Tracking newly locked target: [${det.label.toUpperCase()}] assigned ID #${newId}`, 'success');
    });

    // Write updated trackers back to refs and states
    activeTrackersRef.current = updatedTrackers;
    setTrackedItems(updatedTrackers.filter(t => t.inactiveCount === 0));
  };

  // Helper overlay rendering routines (drawing trail lines, brackets, metrics)
  const drawTrackingOverlays = (ctx: CanvasRenderingContext2D) => {
    const activeTrackers = activeTrackersRef.current;

    activeTrackers.forEach(tracker => {
      if (tracker.inactiveCount > 0) return; // Don't draw decayed vectors

      const [x, y, w, h] = tracker.bbox;

      // 1. Render historical line trail coordinates
      if (tracker.history.length > 1) {
        ctx.strokeStyle = tracker.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 2]); // Monospace dashed aesthetic
        ctx.beginPath();
        ctx.moveTo(tracker.history[0][0], tracker.history[0][1]);
        for (let i = 1; i < tracker.history.length; i++) {
          ctx.lineTo(tracker.history[i][0], tracker.history[i][1]);
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash state
      }

      // 2. Draw sharp rectangular bounding borders
      ctx.strokeStyle = tracker.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.stroke();

      // Corner accent brackets for brutalist/high-tech telemetry look
      ctx.fillStyle = tracker.color;
      const len = 12;
      const thick = 4.5;
      
      // Top Left Corner Bracket
      ctx.fillRect(x - thick/2, y - thick/2, len, thick);
      ctx.fillRect(x - thick/2, y - thick/2, thick, len);

      // Top Right Corner Bracket
      ctx.fillRect(x + w - len + thick/2, y - thick/2, len, thick);
      ctx.fillRect(x + w - thick/2, y - thick/2, thick, len);

      // Bottom Left
      ctx.fillRect(x - thick/2, y + h - thick/2, len, thick);
      ctx.fillRect(x - thick/2, y + h - len + thick/2, thick, len);

      // Bottom Right
      ctx.fillRect(x + w - len + thick/2, y + h - thick/2, len, thick);
      ctx.fillRect(x + w - thick/2, y + h - len + thick/2, thick, len);

      // 3. Draw ID and category HUD text tag (Standard square tag)
      ctx.fillStyle = tracker.color;
      ctx.font = 'black 10px monospace';
      const labelText = `ID #${tracker.id} : ${tracker.label.toUpperCase()}`;
      const textWidth = ctx.measureText(labelText).width;
      
      // Draw background tag block
      ctx.fillRect(x, y - 18, textWidth + 14, 18);

      // Draw white text over tag capsule
      ctx.fillStyle = '#ffffff';
      ctx.fillText(labelText, x + 7, y - 5);

      // Draw current centroid point indicator
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(tracker.centroid[0], tracker.centroid[1], 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = tracker.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  };

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
  };

  const handleStreamTypeChange = (type: 'webcam' | 'simulation') => {
    setIsStreaming(false);
    setTimeout(() => {
      setActiveStreamType(type);
    }, 150);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8" id="tracker-task">
      
      {/* Header and Subtitles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-neon text-white text-[10px] font-black uppercase tracking-widest font-mono mb-3 shadow-sm">
            <Activity className="w-3.5 h-3.5 animate-pulse text-white" />
            AI_VISION_TRACKER_NODE
          </span>
          <h2 className="text-3xl font-display font-black text-zinc-900 uppercase tracking-tighter">
            Object Detection & Tracking
          </h2>
          <p className="text-xs text-zinc-500 mt-1.5 font-sans">
            Mathematical Centroid and IoU tracker processing frame sequences in real-time over COCO-SSD tensors.
          </p>
        </div>
        
        {/* Stream Type Selectors */}
        <div className="flex bg-zinc-50 p-1 mt-4 md:mt-0 gap-1 border border-zinc-200 rounded-none self-start shadow-sm">
          <button
            id="select-simulated-stream-btn"
            onClick={() => handleStreamTypeChange('simulation')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeStreamType === 'simulation'
                ? 'bg-brand-neon text-white font-bold shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Tv className="w-4 h-4" />
            SIM_FEED
          </button>
          <button
            id="select-webcam-stream-btn"
            onClick={() => handleStreamTypeChange('webcam')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeStreamType === 'webcam'
                ? 'bg-brand-neon text-white font-bold shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            LIVE_WEBCAM
          </button>
        </div>
      </div>

      {/* Main Tracker workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Stream Canvas Display (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-100 aspect-[4/3] w-full border border-zinc-200 flex items-center justify-center relative group overflow-hidden rounded-none shadow-sm">
            
            {/* Hidden video element used to capture camera input before drawing to canvas */}
            <video
              ref={videoRef}
              className="hidden"
              playsInline
              muted
              width="640"
              height="480"
            />
 
            {/* Rendering Overlay Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
            />

            {/* Standby/Startup Screen overlay */}
            {!isStreaming && (
              <div className="absolute inset-0 bg-zinc-50/95 flex flex-col items-center justify-center text-center p-6 space-y-4 rounded-none z-10">
                <div className="p-4 bg-white border border-zinc-200 text-brand-neon shadow-sm">
                  {activeStreamType === 'webcam' ? (
                    <CameraOff className="w-8 h-8 text-brand-neon" />
                  ) : (
                    <Tv className="w-8 h-8 text-brand-neon" />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-black text-zinc-800 text-base uppercase tracking-wider">
                    Trace Gateway Offline
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-relaxed font-sans">
                    {activeStreamType === 'webcam'
                      ? 'Launch webcam mode to detect actual physical objects (e.g. persons, mobile devices, laptops) with mathematical trace paths.'
                      : 'Load vector security camera simulator to test the core centroid trajectory equations.'}
                  </p>
                </div>
                <button
                  id="activate-tracking-btn"
                  onClick={toggleStream}
                  disabled={loadingModel && activeStreamType === 'webcam'}
                  className="bg-brand-neon hover:bg-brand-neon/90 text-white text-xs font-black px-5 py-3 rounded-none uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                >
                  <Play className="w-4 h-4 fill-current text-white" />
                  CONNECT_TRACE_FEED
                </button>
              </div>
            )}

            {/* Loading Model Overlay indicator */}
            {loadingModel && activeStreamType === 'webcam' && (
              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center text-center p-6 space-y-3 z-20 rounded-none">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-neon mb-2" />
                <p className="text-xs uppercase font-mono tracking-widest text-zinc-800">Downloading MobileNetV2 COCO Tensors...</p>
                <p className="text-[10px] text-zinc-500 font-mono max-w-xs leading-relaxed uppercase">
                  TF.js relies on initial network downloading of object weights (~20MB). Subsequent activations are instant.
                </p>
              </div>
            )}
          </div>

          {/* Action Dashboard Panel under video */}
          {isStreaming && (
            <div className="bg-white border border-zinc-200 px-4 py-3 rounded-none flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-neon animate-ping" />
                <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider font-mono">
                  LOCK_FEED: {activeStreamType.toUpperCase()}
                </span>
              </div>
              <button
                id="pause-tracking-btn"
                onClick={toggleStream}
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold uppercase px-4 py-1.5 rounded-none transition-all flex items-center gap-1 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" /> STOP_STREAM
              </button>
            </div>
          )}
        </div>

        {/* Tracking Logs & HUD Panel (Right 1 column) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Active Tracker List */}
          <div className="bg-white p-5 rounded-none border border-zinc-200 space-y-4 shadow-sm">
            <h3 className="font-display font-black text-zinc-800 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4 text-brand-neon" />
              LOCKS_ENGAGED ({trackedItems.length})
            </h3>

            {trackedItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 bg-zinc-50 font-mono uppercase tracking-wide">
                No active targets locked in sequence buffer.
              </div>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {trackedItems.map(tracker => (
                  <div 
                    key={`tracker-${tracker.id}`}
                    className="flex items-center justify-between p-2.5 rounded-none border border-zinc-200 bg-zinc-50 text-xs shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-none border border-black/10" 
                        style={{ backgroundColor: tracker.color }}
                      />
                      <div>
                        <span className="font-black text-zinc-800 uppercase font-mono text-[11px]">
                          {tracker.label}
                        </span>
                        <span className="text-zinc-400 ml-1.5 font-mono text-[10px]">
                          ID_{tracker.id}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-1.5 text-zinc-500 font-mono text-[9px] uppercase tracking-wide bg-white px-2 py-0.5 border border-zinc-200">
                      <History className="w-3 h-3 text-zinc-400" />
                      <span>{tracker.history.length} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time System Event Logs */}
          <div className="bg-white p-5 rounded-none border border-zinc-200 flex flex-col space-y-3 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 justify-between">
              <h3 className="font-display font-black text-zinc-800 flex items-center gap-2 text-xs uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-brand-neon" />
                SURVEILLANCE_HUD_LOG
              </h3>
              {systemLogs.length > 0 && (
                <button
                  id="clear-logs-btn"
                  onClick={() => setSystemLogs([])}
                  className="text-[9px] font-mono text-zinc-400 hover:text-brand-neon hover:underline uppercase cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>

            <div className="h-[200px] overflow-y-auto pr-1 space-y-2 font-mono text-[9px] leading-tight">
              {systemLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-400 text-center uppercase tracking-wide">
                  Awaiting feed sequence stream...
                </div>
              ) : (
                systemLogs.map(log => (
                  <div key={log.id} className="flex gap-2 items-start text-zinc-500 animate-fadeIn">
                    <span className="text-zinc-300 select-none">[{log.time}]</span>
                    <span className={
                      log.type === 'success' ? 'text-brand-neon font-black' :
                      log.type === 'warn' ? 'text-red-500 font-bold' : ''
                    }>
                      {log.text.toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
