"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Download, X } from "lucide-react"

interface CameraFilterGameProps {
  onComplete: (rating?: number) => void
}

export function CameraFilterGame({ onComplete }: CameraFilterGameProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft])

  // Request camera permission
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })
      setStream(mediaStream)
      setHasPermission(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      alert("Please allow camera access to use filters!")
    }
  }

  // Stop camera
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame
    ctx.drawImage(video, 0, 0)

    setCapturedImage(canvas.toDataURL("image/png"))
  }

  // Download captured image
  const downloadImage = () => {
    if (!capturedImage) return

    const link = document.createElement("a")
    link.href = capturedImage
    link.download = `wolf-chan-photo-${Date.now()}.png`
    link.click()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-balance">Camera Photo Challenge</CardTitle>
        <p className="text-muted-foreground">Take photos in 2 minutes!</p>
        <div className="text-2xl font-bold text-primary mt-2">Time: {formatTime(timeLeft)}</div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!hasPermission ? (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="mb-4 text-lg">We need camera access to take photos</p>
            <Button onClick={startCamera} size="lg">
              <Camera className="w-5 h-5 mr-2" />
              Allow Camera Access
            </Button>
          </div>
        ) : (
          <>
            {/* Camera View */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={capturePhoto} className="flex-1" size="lg">
                <Camera className="w-5 h-5 mr-2" />
                Capture Photo
              </Button>
              <Button onClick={onComplete} variant="outline" size="lg">
                <X className="w-5 h-5 mr-2" />
                Done
              </Button>
            </div>

            {/* Captured Image Preview */}
            {capturedImage && (
              <div className="space-y-2">
                <p className="font-semibold">Captured Photo:</p>
                <div className="relative rounded-lg overflow-hidden">
                  <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full" />
                </div>
                <Button onClick={downloadImage} variant="outline" className="w-full bg-transparent">
                  <Download className="w-5 h-5 mr-2" />
                  Download Image
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
