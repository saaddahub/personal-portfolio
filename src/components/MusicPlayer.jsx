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
  const [isShuffle, setIsShuffle] = useState(false);
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
  }, [currentTrackIndex]);

  // Click outside to collapse
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
    if (isShuffle) {
      let randomIndex = Math.floor(Math.random() * TRACKS.length);
      if (randomIndex === currentTrackIndex && TRACKS.length > 1) {
        randomIndex = (randomIndex + 1) % TRACKS.length;
      }
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    }
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
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

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div 
      className={`music-sidebar-wrapper ${isExpanded ? 'expanded' : ''}`}
      ref={wrapperRef}
    >
      {/* Floating Side Tab Button */}
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

      {/* UIVERSE Interactive Music Player Panel */}
      <div className="music-player-panel">
        <div className="uiverse-music-container">
          
          {/* Top Floating Vinyl Disc (peeking out) */}
          <div className="uiverse-disc-top-wrapper">
            <svg
              width="128"
              height="128"
              viewBox="0 0 128 128"
              className={`uiverse-vinyl-svg ${isPlaying ? 'is-spinning' : ''}`}
              onClick={togglePlay}
            >
              <rect width="128" height="128" fill="#121214"></rect>
              <circle cx="20" cy="20" r="2" fill="white"></circle>
              <circle cx="40" cy="30" r="2" fill="white"></circle>
              <circle cx="60" cy="10" r="2" fill="white"></circle>
              <circle cx="80" cy="40" r="2" fill="white"></circle>
              <circle cx="100" cy="20" r="2" fill="white"></circle>
              <circle cx="120" cy="50" r="2" fill="white"></circle>
              <circle cx="90" cy="30" r="10" fill="white" fillOpacity="0.5"></circle>
              <circle cx="90" cy="30" r="8" fill="white"></circle>
              <path d="M0 128 Q32 64 64 128 T128 128" fill="#7C3AED" stroke="black" strokeWidth="1"></path>
              <path d="M0 128 Q32 48 64 128 T128 128" fill="#A78BFA" stroke="black" strokeWidth="1"></path>
              <path d="M0 128 Q32 32 64 128 T128 128" fill="#5B21B6" stroke="black" strokeWidth="1"></path>
              <path d="M0 128 Q16 64 32 128 T64 128" fill="#7C3AED" stroke="black" strokeWidth="1"></path>
              <path d="M64 128 Q80 64 96 128 T128 128" fill="#A78BFA" stroke="black" strokeWidth="1"></path>
            </svg>
            <div className="uiverse-disc-center"></div>
          </div>

          {/* Main Card */}
          <div className="uiverse-card">
            
            {/* Top Card Section: Mini Spun Disc & Song Info */}
            <div className="uiverse-card-header">
              <div className={`uiverse-mini-disc-wrapper ${isPlaying ? 'is-spinning' : ''}`} onClick={togglePlay}>
                <svg
                  width="96"
                  height="96"
                  viewBox="0 0 128 128"
                  className="uiverse-mini-vinyl-svg"
                >
                  <rect width="128" height="128" fill="#121214"></rect>
                  <circle cx="20" cy="20" r="2" fill="white"></circle>
                  <circle cx="40" cy="30" r="2" fill="white"></circle>
                  <circle cx="60" cy="10" r="2" fill="white"></circle>
                  <circle cx="80" cy="40" r="2" fill="white"></circle>
                  <circle cx="100" cy="20" r="2" fill="white"></circle>
                  <circle cx="120" cy="50" r="2" fill="white"></circle>
                  <circle cx="90" cy="30" r="10" fill="white" fillOpacity="0.5"></circle>
                  <circle cx="90" cy="30" r="8" fill="white"></circle>
                  <path d="M0 128 Q32 64 64 128 T128 128" fill="#7C3AED" stroke="black" strokeWidth="1"></path>
                  <path d="M0 128 Q32 48 64 128 T128 128" fill="#A78BFA" stroke="black" strokeWidth="1"></path>
                  <path d="M0 128 Q32 32 64 128 T128 128" fill="#5B21B6" stroke="black" strokeWidth="1"></path>
                  <path d="M0 128 Q16 64 32 128 T64 128" fill="#7C3AED" stroke="black" strokeWidth="1"></path>
                  <path d="M64 128 Q80 64 96 128 T128 128" fill="#A78BFA" stroke="black" strokeWidth="1"></path>
                </svg>
                <div className="uiverse-mini-disc-center"></div>
              </div>

              <div className="uiverse-track-text">
                <p className="uiverse-track-title" title={currentTrack.title}>{currentTrack.title}</p>
                <p className="uiverse-track-artist">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Middle Section: Scrubber Progress */}
            <div className="uiverse-progress-bar-container">
              <span className="uiverse-time-label">{currentTime}</span>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={handleProgressChange}
                className="uiverse-slider"
                aria-label="Track progress"
              />
              <span className="uiverse-time-label">{duration}</span>
            </div>

            {/* Bottom Controls Row */}
            <div className="uiverse-controls-row">
              {/* Shuffle / Repeat */}
              <button
                className={`uiverse-ctrl-btn uiverse-mode-btn ${isShuffle ? 'active' : ''}`}
                onClick={() => setIsShuffle(!isShuffle)}
                title={isShuffle ? 'Shuffle Active' : 'Repeat All'}
                aria-label="Toggle play mode"
              >
                {isShuffle ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 3 21 3 21 8"></polyline>
                    <line x1="4" y1="20" x2="21" y2="3"></line>
                    <polyline points="21 16 21 21 16 21"></polyline>
                    <line x1="15" y1="15" x2="21" y2="21"></line>
                    <line x1="4" y1="4" x2="9" y2="9"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="17 1 21 5 17 9"></polyline>
                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                    <polyline points="7 23 3 19 7 15"></polyline>
                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                  </svg>
                )}
              </button>

              {/* Prev */}
              <button 
                className="uiverse-ctrl-btn" 
                onClick={handlePrev}
                title="Previous Track"
                aria-label="Previous track"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="19 20 9 12 19 4 19 20"></polygon>
                  <line x1="5" y1="19" x2="5" y2="5"></line>
                </svg>
              </button>

              {/* Play / Pause Toggle */}
              <button 
                className="uiverse-ctrl-btn uiverse-play-toggle" 
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>

              {/* Next */}
              <button 
                className="uiverse-ctrl-btn" 
                onClick={handleNext}
                title="Next Track"
                aria-label="Next track"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4"></polygon>
                  <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
              </button>

              {/* Playlist Drawer Button */}
              <button 
                className={`uiverse-ctrl-btn uiverse-list-btn ${showPlaylist ? 'active' : ''}`}
                onClick={() => setShowPlaylist(!showPlaylist)}
                title="Playlist"
                aria-label="Toggle playlist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Playlist dropdown inside card */}
            {showPlaylist && (
              <div className="uiverse-playlist-popover">
                {TRACKS.map((track, idx) => (
                  <button
                    key={idx}
                    className={`uiverse-playlist-item ${idx === currentTrackIndex ? 'active' : ''}`}
                    onClick={() => selectTrack(idx)}
                  >
                    <span className="uiverse-item-index">0{idx + 1}</span>
                    <span className="uiverse-item-title">{track.title}</span>
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
