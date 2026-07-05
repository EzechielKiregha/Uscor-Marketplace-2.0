"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    type CachedProduct,
    searchCachedProducts,
} from "@/lib/catalog-cache";
import {
    Camera,
    CameraOff,
    Flashlight,
    FlashlightOff,
    RotateCcw,
    Search,
    X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  onProductFound: (product: CachedProduct) => void;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  storeId,
  onProductFound,
}: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [searchResults, setSearchResults] = useState<CachedProduct[]>([]);
  const [scanning, setScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }

      // Check torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.();
      if (capabilities && "torch" in capabilities) {
        setHasTorch(true);
      }

      // Start scanning frames using BarcodeDetector API
      startScanning();
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setCameraError(
          "Camera access denied. Please allow camera access in your browser settings.",
        );
      } else if (err.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError(`Camera error: ${err.message}`);
      }
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setScanning(false);
    setTorchOn(false);
    setHasTorch(false);
  }, []);

  // Toggle torch
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn } as any],
      });
      setTorchOn(!torchOn);
    } catch {
      // Torch not supported
    }
  }, [torchOn]);

  // Start barcode scanning using BarcodeDetector API
  const startScanning = useCallback(() => {
    if (!("BarcodeDetector" in window)) {
      // Fallback: no native barcode API, use manual input only
      setCameraError(
        "Barcode scanning not supported in this browser. Use manual entry below.",
      );
      return;
    }

    setScanning(true);
    const detector = new (window as any).BarcodeDetector({
      formats: [
        "ean_13",
        "ean_8",
        "upc_a",
        "upc_e",
        "code_128",
        "code_39",
        "qr_code",
      ],
    });

    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      try {
        const barcodes = await detector.detect(videoRef.current);
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue;
          if (code && code !== lastScannedCode) {
            setLastScannedCode(code);
            await handleBarcodeDetected(code);
          }
        }
      } catch {
        // Detection frame failed, continue scanning
      }
    }, 250);
  }, [lastScannedCode, storeId]);

  // Handle barcode detection
  const handleBarcodeDetected = useCallback(
    async (barcode: string) => {
      setManualBarcode(barcode);
      const results = await searchCachedProducts(storeId, barcode);
      setSearchResults(results);

      if (results.length === 1) {
        // Auto-select if exact match
        onProductFound(results[0]);
        onClose();
      }
    },
    [storeId, onProductFound, onClose],
  );

  // Manual barcode search
  const handleManualSearch = useCallback(async () => {
    if (!manualBarcode.trim()) return;
    const results = await searchCachedProducts(storeId, manualBarcode.trim());
    setSearchResults(results);

    if (results.length === 1) {
      onProductFound(results[0]);
      onClose();
    }
  }, [manualBarcode, storeId, onProductFound, onClose]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setManualBarcode("");
      setSearchResults([]);
      setLastScannedCode(null);
    }
  }, [isOpen, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border hover:border-primary hover:bg-primary/5 rounded-lg w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Barcode Scanner</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Camera View */}
        <div className="relative bg-black aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanning overlay */}
          {cameraActive && scanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-3/4 h-1/3 border-2 border-primary rounded-lg relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                {/* Scanning line animation */}
                <div className="absolute inset-x-2 top-1/2 h-0.5 bg-primary/60 animate-pulse" />
              </div>
              <p className="absolute bottom-3 text-white text-xs bg-black/50 px-2 py-1 rounded">
                Point camera at barcode
              </p>
            </div>
          )}

          {/* Camera inactive */}
          {!cameraActive && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4">
              <CameraOff className="h-12 w-12 opacity-50" />
              <Button
                onClick={startCamera}
                className="bg-primary hover:bg-accent text-primary-foreground"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            </div>
          )}

          {/* Camera error */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3 p-4">
              <CameraOff className="h-10 w-10 opacity-50" />
              <p className="text-sm text-center opacity-80">{cameraError}</p>
              <Button
                onClick={startCamera}
                variant="outline"
                size="sm"
                className="text-white border-white/30"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {/* Camera controls */}
          {cameraActive && (
            <div className="absolute top-2 right-2 flex gap-2">
              {hasTorch && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 text-white hover:bg-black/70 h-8 w-8"
                  onClick={toggleTorch}
                >
                  {torchOn ? (
                    <Flashlight className="h-4 w-4" />
                  ) : (
                    <FlashlightOff className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 text-white hover:bg-black/70 h-8 w-8"
                onClick={stopCamera}
              >
                <CameraOff className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Last scanned code */}
          {lastScannedCode && (
            <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
              Scanned: {lastScannedCode}
            </div>
          )}
        </div>

        {/* Manual Entry */}
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Enter barcode manually..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button onClick={handleManualSearch} disabled={!manualBarcode.trim()}>
              Search
            </Button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border border-border rounded-lg divide-y divide-border max-h-48 overflow-y-auto">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onProductFound(product);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                    {product.medias?.[0]?.url ? (
                      <img
                        src={product.medias[0].url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {product.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {product.barcode && <span>Barcode: {product.barcode}</span>}
                      {product.sku && <span>SKU: {product.sku}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary text-sm">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stock: {product.quantity}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && manualBarcode.trim() && (
            <p className="text-center text-sm text-muted-foreground py-2">
              No products found for "{manualBarcode}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
