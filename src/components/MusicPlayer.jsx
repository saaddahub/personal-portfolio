import { useState, useRef, useEffect } from 'react';
import './MusicPlayer.css';

const TRACKS = [
  {
    title: '2 AM Debug Loop',
    artist: 'Open Lofi • Focus',
    url: '/audio/2-am-debug-loop.mp3'
  },
  {
    title: 'Midnight Window Glow',
    artist: 'Open Lofi • Chillhop',
    url: '/audio/midnight-window-glow.mp3'
  },
  {
    title: 'Electric Puddles',
    artist: 'Open Lofi • Dreamscape',
    url: '/audio/electric-puddles.mp3'
  },
  {
    title: 'Rooftop Static Dreams',
    artist: 'Open Lofi • Ambient',
    url: '/audio/rooftop-static-dreams.mp3'
  },
  {
    title: 'Rain On Glass',
    artist: 'Ambient Soundscape',
    url: '/audio/rain.mp3'
  }
];

const MusicPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const audioRef = useRef(null);
  const wrapperRef = useRef(null);

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds === Infinity) return '0:00';
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;

    const handleTimeUpdate = () => {
      setCurrentTime(formatTime(audio.currentTime));
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(formatTime(audio.duration));
    };

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, volume, isMuted]);

  // Click outside to collapse if expanded
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target) && isExpanded) {
        setIsExpanded(false);
        setShowPlaylist(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Playback prevented:', err);
      });
    }
  };

  const handleNext = () => {
    const nextIndex = (currentTrackIndex + 1) % TRACKS.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    const prevIndex = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  const selectTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setShowPlaylist(false);
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(e => console.log('Autoplay handled:', e));
    }
  }, [currentTrackIndex]);

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (audioRef.current.duration / 100) * newProgress;
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div 
      className={`music-sidebar-wrapper ${isExpanded ? 'expanded' : ''}`}
      ref={wrapperRef}
    >
      {/* Floating Side Tab / Button */}
      <button 
        className={`music-toggle-btn ${isPlaying ? 'is-playing' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Collapse Music Player' : 'Open Music Player'}
        title="Background Music"
      >
        <div className="music-tab-content">
          <svg 
            className="music-note-icon"
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>

          {/* Equalizer Wave Animation */}
          {isPlaying && (
            <div className="sound-bars">
              <span className="bar bar-1"></span>
              <span className="bar bar-2"></span>
              <span className="bar bar-3"></span>
            </div>
          )}
        </div>
      </button>

      {/* Hidden Native Audio Element */}
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        preload="metadata"
      />

      {/* The Music Player Card Panel */}
      <div className="music-player-panel">
        <div className="music-card">
          
          {/* Top Row: Vinyl Disc & Track Info */}
          <div className="player-header">
            {/* Spinning Vinyl Record Artwork */}
            <div className="vinyl-wrapper" onClick={togglePlay}>
              <div className={`vinyl-disc ${isPlaying ? 'spinning' : ''}`}>
                <div className="vinyl-grooves"></div>
                <div className="vinyl-label">
                  <div className="vinyl-center-dot"></div>
                </div>
              </div>
            </div>

            {/* Track Info */}
            <div className="player-track-info">
              <div className="track-status-pill">
                <span className={`status-dot ${isPlaying ? 'active' : ''}`}></span>
                {isPlaying ? 'Now Playing' : 'Paused'}
              </div>
              <h4 className="track-title" title={currentTrack.title}>
                {currentTrack.title}
              </h4>
              <p className="track-artist">{currentTrack.artist}</p>
            </div>

            {/* Playlist Toggle */}
            <button 
              className={`playlist-toggle-btn ${showPlaylist ? 'active' : ''}`}
              onClick={() => setShowPlaylist(!showPlaylist)}
              title="Playlist"
              aria-label="Toggle playlist"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="player-progress-section">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={handleProgressChange}
              className="player-slider"
              aria-label="Track progress"
            />
            <div className="player-time-row">
              <span>{currentTime}</span>
              <span>{duration}</span>
            </div>
          </div>

          {/* Controls: Prev, Play/Pause, Next & Volume */}
          <div className="player-controls">
            {/* Volume Control */}
            <div className="player-volume-group">
              <button 
                className="control-btn icon-btn" 
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label="Toggle mute"
              >
                {isMuted || volume === 0 ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                )}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={isMuted ? 0 : volume} 
                onChange={handleVolumeChange} 
                className="volume-slider"
                aria-label="Volume"
              />
            </div>

            {/* Playback Buttons */}
            <div className="playback-btns">
              <button 
                className="control-btn icon-btn" 
                onClick={handlePrev}
                title="Previous Track"
                aria-label="Previous track"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="19 20 9 12 19 4 19 20"></polygon>
                  <line x1="5" y1="19" x2="5" y2="5"></line>
                </svg>
              </button>

              <button 
                className="control-btn play-btn" 
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>

              <button 
                className="control-btn icon-btn" 
                onClick={handleNext}
                title="Next Track"
                aria-label="Next track"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4"></polygon>
                  <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Playlist Dropdown / Drawer */}
          {showPlaylist && (
            <div className="player-playlist">
              <p className="playlist-header">Select Track</p>
              <div className="playlist-items">
                {TRACKS.map((track, idx) => (
                  <button
                    key={idx}
                    className={`playlist-item ${idx === currentTrackIndex ? 'active' : ''}`}
                    onClick={() => selectTrack(idx)}
                  >
                    <span className="playlist-track-idx">0{idx + 1}</span>
                    <div className="playlist-track-meta">
                      <span className="playlist-track-name">{track.title}</span>
                      <span className="playlist-track-sub">{track.artist}</span>
                    </div>
                    {idx === currentTrackIndex && isPlaying && (
                      <span className="playing-indicator">▶</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
