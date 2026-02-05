import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react'

interface AudioRecorderProps {
  onAudioReady: (blob: Blob | null) => void
  brandColor?: string
  maxDuration?: number // in seconds
}

export default function AudioRecorder({ 
  onAudioReady, 
  brandColor = '#4f46e5',
  maxDuration = 120 // 2 minutes default
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [permissionDenied, setPermissionDenied] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
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
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        onAudioReady(blob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(1000) // Collect data every second
      setIsRecording(true)
      setDuration(0)
      setPermissionDenied(false)

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

    } catch (err) {
      console.error('Error accessing microphone:', err)
      setPermissionDenied(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setDuration(prev => {
            if (prev >= maxDuration - 1) {
              stopRecording()
              return maxDuration
            }
            return prev + 1
          })
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setPlaybackTime(0)
    setIsPlaying(false)
    onAudioReady(null)
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
    setPlaybackTime(0)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setPlaybackTime(audioRef.current.currentTime)
    }
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
          No se pudo acceder al micrófono
        </p>
        <p className="text-red-600 text-xs">
          Por favor, permite el acceso al micrófono en tu navegador
        </p>
        <button
          type="button"
          onClick={() => setPermissionDenied(false)}
          className="mt-3 text-sm text-red-700 hover:text-red-800 underline"
        >
          Intentar de nuevo
        </button>
      </div>
    )
  }

  // Show recorded audio with playback controls
  if (audioUrl && audioBlob) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onEnded={handleAudioEnded}
          onTimeUpdate={handleTimeUpdate}
        />
        
        <div className="flex items-center space-x-4">
          {/* Play/Pause button */}
          <button
            type="button"
            onClick={togglePlayback}
            className="h-12 w-12 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105"
            style={{ backgroundColor: brandColor }}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>

          {/* Waveform placeholder / progress */}
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-100"
                style={{ 
                  width: `${(playbackTime / duration) * 100}%`,
                  backgroundColor: brandColor 
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>{formatTime(playbackTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Delete button */}
          <button
            type="button"
            onClick={deleteRecording}
            className="h-10 w-10 rounded-full flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <p className="text-center text-xs text-green-600 mt-3">
          ✓ Audio grabado correctamente
        </p>
      </div>
    )
  }

  // Recording interface
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      {isRecording ? (
        // Recording in progress
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-4">
            {/* Pulsing ring */}
            <div 
              className="absolute h-20 w-20 rounded-full animate-ping opacity-25"
              style={{ backgroundColor: brandColor }}
            />
            {/* Main button */}
            <button
              type="button"
              onClick={stopRecording}
              className="relative h-16 w-16 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105"
              style={{ backgroundColor: '#ef4444' }}
            >
              <Square className="h-6 w-6" />
            </button>
          </div>

          <p className="text-2xl font-mono font-bold text-gray-900 mb-1">
            {formatTime(duration)}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {isPaused ? 'En pausa' : 'Grabando...'}
          </p>

          <div className="flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={pauseRecording}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              {isPaused ? (
                <>
                  <Mic className="h-4 w-4" />
                  <span>Continuar</span>
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pausar</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Máximo {formatTime(maxDuration)}
          </p>
        </div>
      ) : (
        // Ready to record
        <div className="text-center">
          <button
            type="button"
            onClick={startRecording}
            className="h-16 w-16 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 mx-auto mb-4"
            style={{ backgroundColor: brandColor }}
          >
            <Mic className="h-7 w-7" />
          </button>
          <p className="text-sm font-medium text-gray-900 mb-1">
            Grabar audio
          </p>
          <p className="text-xs text-gray-500">
            Pulsa para empezar a grabar tu testimonio
          </p>
        </div>
      )}
    </div>
  )
}
