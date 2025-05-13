import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/Button';

const AMBIENT_SOUNDS = [
  { id: 'rain', name: 'Rain', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c6b70540d6.mp3' },
  { id: 'waves', name: 'Ocean Waves', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c1b4e6df4c.mp3' },
  { id: 'forest', name: 'Forest', url: 'https://cdn.pixabay.com/download/audio/2021/10/06/audio_b89ce9ca0e.mp3' },
  { id: 'cafe', name: 'Cafe', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c1b4e6df4c.mp3' },
];

export function FocusMode() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      await containerRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const toggleSound = (soundId: string) => {
    if (activeSound === soundId) {
      audioRef.current?.pause();
      setActiveSound(null);
    } else {
      const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
      if (sound && audioRef.current) {
        audioRef.current.src = sound.url;
        audioRef.current.volume = volume;
        audioRef.current.loop = true;
        audioRef.current.play();
        setActiveSound(soundId);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Focus Mode</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="dark:text-gray-300"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 dark:text-white">Ambient Sounds</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AMBIENT_SOUNDS.map((sound) => (
                <Button
                  key={sound.id}
                  variant={activeSound === sound.id ? 'primary' : 'outline'}
                  onClick={() => toggleSound(sound.id)}
                  className="w-full"
                >
                  {activeSound === sound.id ? <Volume2 size={18} className="mr-2" /> : <VolumeX size={18} className="mr-2" />}
                  {sound.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium dark:text-gray-300">
              Volume
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>

        <audio ref={audioRef} />
      </div>
    </div>
  );
}