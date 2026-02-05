import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'

interface AudioPlayerProps {
  src: string
  compact?: boolean
  brandColor?: string
}

export default function AudioPlayer({ 
  src, 
  compact = false,
  brandColor = '#4f46e5' 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [src])

  const togglePlay = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (compact) {
    return (
      <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
        <audio ref={audioRef} src={src} preload="metadata" />
        
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="h-8 w-8 rounded-full flex items-center justify-center text-white flex-shrink-0 disabled:opacity-50"
          style={{ backgroundColor: brandColor }}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="h-1.5 bg-gray-300 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-100"
              style={{ width: `${progress}%`, backgroundColor: brandColor }}
            />
          </div>
        </div>

        <span className="text-xs text-gray-500 flex-shrink-0">
          {formatTime(currentTime)}/{formatTime(duration)}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex items-center space-x-4">
        {/* Play button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="h-12 w-12 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105 flex-shrink-0 disabled:opacity-50"
          style={{ backgroundColor: brandColor }}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </button>

        {/* Progress */}
        <div className="flex-1 min-w-0">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${brandColor} 0%, ${brandColor} ${progress}%, #d1d5db ${progress}%, #d1d5db 100%)`
            }}
          />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume icon */}
        <Volume2 className="h-5 w-5 text-gray-400 flex-shrink-0" />
      </div>

      <div className="flex items-center justify-center mt-2">
        <span className="text-xs text-gray-500 flex items-center space-x-1">
          <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>Testimonio en audio</span>
        </span>
      </div>
    </div>
  )
}
