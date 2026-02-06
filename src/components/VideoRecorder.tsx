import { useState, useRef, useEffect } from 'react'
import { Video, Square, Play, Pause, Trash2, RotateCcw } from 'lucide-react'

interface VideoRecorderProps {
  onVideoReady: (blob: Blob | null) => void
  brandColor?: string
  maxDuration?: number // in seconds
}

export default function VideoRecorder({ 
  onVideoReady, 
  brandColor = '#4f46e5',
  maxDuration = 60 // 1 minute default for video
}: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [isPreview, setIsPreview] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const previewVideoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }

  const startPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode },
        audio: true 
      })
      streamRef.current = stream
      
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream
        previewVideoRef.current.play()
      }
      
      setIsPreview(true)
      setPermissionDenied(false)
    } catch (err) {
      console.error('Error accessing camera:', err)
      setPermissionDenied(true)
    }
  }

  const switchCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    
    try {
      const newFacing = facingMode === 'user' ? 'environment' : 'user'
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: newFacing },
        audio: true 
      })
      streamRef.current = stream
      
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream
        previewVideoRef.current.play()
      }
    } catch (err) {
      console.error('Error switching camera:', err)
    }
  }

  const startRecording = () => {
    if (!streamRef.current) return
    
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9' 
        : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : 'video/mp4'
    })
    
    mediaRecorderRef.current = mediaRecorder
    chunksRef.current = []

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType })
      setVideoBlob(blob)
      const url = URL.createObjectURL(blob)
      setVideoUrl(url)
      onVideoReady(blob)
      
      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      setIsPreview(false)
    }

    mediaRecorder.start(1000)
    setIsRecording(true)
    setDuration(0)

    // Start timer
    timerRef.current = setInterval(() => {
      setDuration(prev => {
        if (prev >= maxDuration - 1) {
          stopRecording()
          return maxDuration
        }
        return prev + 1
      })
    }, 1000)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const deleteRecording = () => {
    cleanup()
    setVideoBlob(null)
    setVideoUrl(null)
    setDuration(0)
    setIsPlaying(false)
    setIsPreview(false)
    onVideoReady(null)
  }

  const togglePlayback = () => {
    if (!videoRef.current || !videoUrl) return
    
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleVideoEnded = () => {
    setIsPlaying(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (permissionDenied) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-800 text-sm mb-2">
          No se pudo acceder a la cámara
        </p>
        <p className="text-red-600 text-xs">
          Por favor, permite el acceso a la cámara en tu navegador
        </p>
        <button
          type="button"
          onClick={() => {
            setPermissionDenied(false)
            startPreview()
          }}
          className="mt-3 text-sm text-red-700 hover:text-red-800 underline"
        >
          Intentar de nuevo
        </button>
      </div>
    )
  }

  // Show recorded video
  if (videoUrl && videoBlob) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="relative rounded-lg overflow-hidden bg-black mb-3">
          <video 
            ref={videoRef} 
            src={videoUrl} 
            onEnded={handleVideoEnded}
            className="w-full aspect-video object-cover"
            playsInline
          />
          
          {/* Play/Pause overlay */}
          <button
            type="button"
            onClick={togglePlayback}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
          >
            <div 
              className="h-14 w-14 rounded-full flex items-center justify-center text-white bg-black/50"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </div>
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Duración: {formatTime(duration)}
          </div>
          <button
            type="button"
            onClick={deleteRecording}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Eliminar</span>
          </button>
        </div>

        <p className="text-center text-xs text-green-600 mt-3">
          ✓ Video grabado correctamente
        </p>
      </div>
    )
  }

  // Preview / Recording interface
  if (isPreview) {
    return (
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="relative">
          <video 
            ref={previewVideoRef}
            className="w-full aspect-video object-cover"
            autoPlay
            playsInline
            muted
          />
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-3 left-3 flex items-center space-x-2">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-sm font-medium bg-black/50 px-2 py-0.5 rounded">
                {formatTime(duration)} / {formatTime(maxDuration)}
              </span>
            </div>
          )}

          {/* Switch camera button */}
          {!isRecording && (
            <button
              type="button"
              onClick={switchCamera}
              className="absolute top-3 right-3 h-10 w-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 flex items-center justify-center space-x-4">
          {isRecording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="h-16 w-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <Square className="h-6 w-6" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop())
                  }
                  setIsPreview(false)
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={startRecording}
                className="h-16 w-16 rounded-full text-white flex items-center justify-center transition-transform hover:scale-105"
                style={{ backgroundColor: brandColor }}
              >
                <div className="h-6 w-6 bg-red-500 rounded-full" />
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Initial state - ready to start preview
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <div className="text-center">
        <button
          type="button"
          onClick={startPreview}
          className="h-16 w-16 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 mx-auto mb-4"
          style={{ backgroundColor: brandColor }}
        >
          <Video className="h-7 w-7" />
        </button>
        <p className="text-sm font-medium text-gray-900 mb-1">
          Grabar video
        </p>
        <p className="text-xs text-gray-500">
          Pulsa para activar la cámara y grabar tu testimonio
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Máximo {formatTime(maxDuration)}
        </p>
      </div>
    </div>
  )
}
