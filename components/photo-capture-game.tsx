"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Download, RotateCcw, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PhotoCaptureGameProps {
  onComplete: (rating?: number) => void
}

export function PhotoCaptureGame({ onComplete }: PhotoCaptureGameProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setPermissionDenied(false)
    } catch (err) {
      setPermissionDenied(true)
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to play this game.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  const startCountdown = () => {
    setCountdown(5)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          capturePhoto()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/png")
        setCapturedImage(imageData)
        stopCamera()
        toast({
          title: "Photo Captured!",
          description: "Your photo is ready to download.",
        })
      }
    }
  }

  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement("a")
      link.download = `focusflow-${Date.now()}.png`
      link.href = capturedImage
      link.click()
      toast({
        title: "Downloaded!",
        description: "Your photo has been saved.",
      })
    }
  }

  const retake = () => {
    setCapturedImage(null)
    setCountdown(null)
    startCamera()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-2xl border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-balance flex items-center justify-center gap-3">
            <Camera className="w-8 h-8 text-primary" />
            Photo Capture Challenge
          </CardTitle>
          <CardDescription className="text-lg">
            Strike a pose! Photo captures in {countdown || "5"} seconds
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Camera View */}
          <div className="relative aspect-video bg-muted rounded-xl overflow-hidden">
            {!capturedImage && !permissionDenied && (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            )}
            {capturedImage && (
              <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-full object-cover" />
            )}
            {permissionDenied && (
              <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                <div>
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-semibold mb-2">Camera Access Required</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please enable camera permissions to play this game
                  </p>
                  <Button onClick={startCamera}>Try Again</Button>
                </div>
              </div>
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-9xl font-bold text-white animate-bounce">{countdown}</div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            {!capturedImage && !permissionDenied && (
              <Button size="lg" onClick={startCountdown} disabled={countdown !== null} className="gap-2">
                <Camera className="w-5 h-5" />
                Capture Photo
              </Button>
            )}

            {capturedImage && (
              <>
                <Button size="lg" onClick={downloadImage} className="gap-2">
                  <Download className="w-5 h-5" />
                  Download
                </Button>
                <Button size="lg" variant="outline" onClick={retake} className="gap-2 bg-transparent">
                  <RotateCcw className="w-5 h-5" />
                  Retake
                </Button>
              </>
            )}

            <Button size="lg" variant="outline" onClick={() => onComplete()} className="gap-2">
              <X className="w-5 h-5" />
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
