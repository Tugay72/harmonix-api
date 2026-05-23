'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Github,
  RefreshCw,
  Music,
  Copy,
  Check,
  CalendarDays,
  Twitter,
  Play,
  ChevronDown,
  BookOpen,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SONGS_JSON_CODE } from '@/lib/source-files';

interface Song {
  id: number;
  title: string;
  artist: string;
  genre: string;
  release_year: number | string;
}

const INITIAL_SONG_LIST: Song[] = JSON.parse(SONGS_JSON_CODE);

export default function Home() {
  const [liveSong, setLiveSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadMethod, setLoadMethod] = useState<'api' | 'fallback'>('api');
  const [copied, setCopied] = useState<boolean>(false);
  const [formattedToday, setFormattedToday] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqItems = [
    {
      title: "How does the daily curate mechanism work?",
      answer: (
        <div className="space-y-2">
          <p>
            Harmonix queries our live endpoint at <code className="text-indigo-300 font-mono bg-white/5 px-1 py-0.5 rounded">https://harmonix-api.vercel.app/api/today</code> precisely at midnight UTC.
          </p>
          <p>
            If the server is unreachable, the system triggers our local **Mathematical Seeding Engine**. This engine uses a Seeded linear algorithm to calculate the Gregorian Ordinal of today, ensuring every listener worldwide continues to receive the exact same synchronized choice.
          </p>
        </div>
      )
    },
    {
      title: "Is there a public API endpoint available?",
      answer: (
        <div className="space-y-2.5">
          <p>
            Yes! The Harmonix API is fully public, fast, and does not require any credentials. It features complete CORS headers, letting you query it directly from standard frontend client scripts or backend microservices.
          </p>
          <div className="bg-black/40 border border-white/5 rounded-lg p-3 font-mono text-[10px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between text-slate-500 border-b border-white/5 pb-1 select-none">
              <span>GET ENDPOINT</span>
              <span className="text-green-500">200 OK</span>
            </div>
            <pre className="overflow-x-auto pt-1">curl https://harmonix-api.vercel.app/api/today</pre>
          </div>
        </div>
      )
    },
    {
      title: "What is the JSON structure returned by the API?",
      answer: (
        <div className="space-y-2">
          <p>
            The response delivers a clear payload containing success indicators and the primary track specifications:
          </p>
          <div className="bg-black/40 border border-white/5 rounded-lg p-3 font-mono text-[10px] text-slate-300">
            <pre className="overflow-x-auto">{`{
  "success": true,
  "song": {
    "title": "Teardrop",
    "artist": "Massive Attack",
    "genre": "Trip-hop",
    "release_year": 1998
  }
}`}</pre>
          </div>
        </div>
      )
    }
  ];

  const calculateGregorianOrdinal = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const utcDate = Date.UTC(year, month - 1, day);
    const utc1970 = Date.UTC(1970, 0, 1);
    const diffMs = utcDate - utc1970;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return 719163 + diffDays;
  };

  const pickSeededSong = (seed: number, list: Song[]): Song => {
    if (list.length === 0) return INITIAL_SONG_LIST[0];

    let s = seed;
    const nextRand = () => {
      s = (1103515245 * s + 12345) % 2147483648;
      return s / 2147483648;
    };

    nextRand();
    nextRand();
    const finalRand = nextRand();
    const index = Math.floor(finalRand * list.length);
    return list[index];
  };

  useEffect(() => {
    let active = true;
    let timerId: NodeJS.Timeout;

    const todayObj = new Date();
    const localStr = todayObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    timerId = setTimeout(() => {
      if (active) {
        setFormattedToday(localStr);
      }
    }, 0);

    const triggerFetch = async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      if (!active) return;

      setIsLoading(true);
      setLoadMethod('api');
      const url = 'https://harmonix-api.vercel.app/api/today';

      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        const data = await res.json();
        if (!active) return;
        if (data.success && data.song) {
          setLiveSong({
            id: 0,
            title: data.song.title,
            artist: data.song.artist,
            genre: data.song.genre || 'Alternative',
            release_year: data.song.release_year || 'Unknown'
          });
          setLoadMethod('api');
        } else {
          throw new Error('Malformed feed structure');
        }
      } catch (err) {
        console.warn('Vercel API offline or unreachable, launching seeding calculation module:', err);
        if (!active) return;

        const today = new Date();
        const seed = calculateGregorianOrdinal(today);
        const fallback = pickSeededSong(seed, INITIAL_SONG_LIST);

        setLiveSong(fallback);
        setLoadMethod('fallback');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    triggerFetch();

    return () => {
      active = false;
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const handleShareClick = () => {
    if (!liveSong) return;
    const textToCopy = `🎶 Today's curator choice on Harmonix is "${liveSong.title}" by ${liveSong.artist}!`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#070709] bg-radial-[circle_at_top_right] from-indigo-950/20 via-[#070709] to-[#070709] text-slate-200 antialiased selection:bg-indigo-500/30 selection:text-white relative overflow-x-hidden">
      
      {/* Aesthetic Glowing Gradient Accents */}
      <div className="absolute top-0 right-1/4 w-[40rem] h-[30rem] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] left-1/4 w-[25rem] h-[25rem] bg-violet-600/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#070709]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-500/20">
              <Music className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white leading-none">Harmonix</h2>
              <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">Live Song Feed</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a 
              href="https://buymeacoffee.com/tugay"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-amber-200 rounded-lg border border-amber-500/20 transition"
            >
              <span>☕</span>
              <span className="hidden sm:inline">Buy me a coffee</span>
            </a>
            <a 
              href="https://github.com/Tugay72/harmonix-api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white rounded-lg border border-white/5 transition"
            >
              <Github className="h-4 w-4 text-indigo-400" />
              <span className="hidden sm:inline">GitHub Repository</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <section className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10 space-y-3">
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Deterministic Daily Playlist</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight"
          >
            Today&apos;s Curator Choice
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed"
          >
            Everyone globally receive the exact same track metadata specification today. This page updates precisely at midnight UTC.
          </motion.p>
        </div>

        {/* Central Dedicated Deck component */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/60 rounded-3xl border border-white/10 p-5 sm:p-7 shadow-3xl backdrop-blur-xl relative overflow-hidden"
        >
          
          {/* Deck Top Date Badge */}
          <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Current Selection Day</span>
                <span className="text-xs font-bold text-white mt-0.5">
                  {formattedToday || "Loading today's date..."}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Live
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading-frame"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="aspect-video relative rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center p-6 text-slate-500"
              >
                <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
                <p className="text-xs font-semibold text-slate-400">Tuning daily frequencies...</p>
                <p className="text-[10px] text-slate-600 mt-1">Fetching live song data from Harmonix Server</p>
              </motion.div>
            ) : liveSong ? (
              <motion.div
                key="song-frame"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                
                {/* 🎨 NEW: Aesthetic Hi-Fi Virtual Vinyl Vinyl & Spectral Audio Equalizer Artwork Card */}
                <div className="relative w-full aspect-[2/1] sm:aspect-[2.4/1] rounded-2xl overflow-hidden border border-white/10 bg-[#08080a]/60 p-5 flex items-center justify-between gap-6 group shadow-2xl">
                  {/* Subtle responsive glowing color anchors */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-2xl pointer-events-none rounded-full group-hover:bg-indigo-500/15 transition-all duration-700" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-violet-600/10 blur-2xl pointer-events-none rounded-full group-hover:bg-violet-600/15 transition-all duration-700" />
                  
                  {/* Analog Spinning Classic Vinyl Component */}
                  <div className="relative flex items-center justify-center shrink-0 w-24 h-24 sm:w-32 sm:h-32">
                    {/* Vinyl Outer Edge Circular Grooves */}
                    <div className="absolute inset-0 rounded-full bg-radial-at-c from-zinc-800 via-zinc-950 to-black border border-white/10 shadow-2xl flex items-center justify-center animate-[spin_12s_linear_infinite] group-hover:animate-[spin_6s_linear_infinite] transition-all">
                      {/* Groove layers */}
                      <div className="w-[85%] h-[85%] rounded-full border border-zinc-900/60 flex items-center justify-center">
                        <div className="w-[70%] h-[70%] rounded-full border border-zinc-950/40 flex items-center justify-center">
                          <div className="w-[50%] h-[50%] rounded-full border border-zinc-900/40 flex items-center justify-center">
                            {/* Colorful Center Vinyl Sticker label */}
                            <div className="w-[35%] h-[35%] rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-inner">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#08080a] border border-white/10" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Floating Styl stylus tonearm arm mock */}
                    <div className="absolute -top-1 -right-1 w-8 h-12 origin-top-right rotate-[-15deg] group-hover:rotate-[2deg] transition-all duration-700 pointer-events-none">
                      <svg className="w-full h-full text-slate-400/85" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2 L12 18 L6 22 L2 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="2" cy="34" r="2" fill="currentColor" />
                      </svg>
                    </div>
                  </div>

                  {/* High Fidelity Technical Control Display metadata panel */}
                  <div className="flex-1 flex flex-col justify-between h-full py-1 text-left font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-indigo-400 font-bold tracking-widest uppercase">System: HIFI DECK 01</span>
                        <span className="text-[9px] text-slate-500 select-none">33 1/3 RPM</span>
                      </div>
                      <h4 className="text-sm font-bold text-white tracking-wide truncate mt-1">
                        {liveSong.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        by: {liveSong.artist}
                      </p>
                    </div>

                    {/* Spectral bars equalizer simulation (hidden on extremely narrow viewports for mobile responsiveness) */}
                    <div className="hidden sm:flex items-end gap-[3px] h-11 bg-[#050507]/60 border border-white/5 px-2.5 py-1.5 rounded-xl w-full max-w-[240px]">
                      {[...Array(14)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-gradient-to-t from-indigo-500 via-violet-500 to-sky-450 rounded-t-sm"
                          animate={{
                            height: ["20%", `${35 + Math.abs(Math.sin((i + 1) * 1.5)) * 60}%`, "20%"]
                          }}
                          transition={{
                            duration: 0.6 + (i % 4) * 0.15,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                            delay: i * 0.04
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[8px] text-slate-500 font-bold">
                      <span>CH_A: DISCRETE METADATA</span>
                      <span>GENRE: {liveSong.genre.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Clean, Text-Only Track Details and Metadata Presentation Row */}
                <div className="bg-black/30 bg-radial-at-b from-indigo-950/10 p-6 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono block">Track Details</span>
                    <h3 className="text-xl font-bold text-white tracking-tight">{liveSong.title}</h3>
                    <p className="text-sm text-slate-400 font-medium">by <span className="text-slate-200">{liveSong.artist}</span></p>
                    
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold rounded-full">
                        {liveSong.genre}
                      </span>
                      <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold rounded-full">
                        {liveSong.release_year}
                      </span>
                    </div>
                  </div>

                  {/* Share Action Button */}
                  <div className="flex items-center justify-end shrink-0">
                    <button
                      onClick={handleShareClick}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                          <span className="text-emerald-400">Copied Metadata!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Share Specification</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Dynamic Search Link Buttons for Streaming Platforms */}
                <div className="space-y-3 pt-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono block px-1">Listen on Your Platform</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Search on Spotify */}
                    <a
                      href={`https://open.spotify.com/search/${encodeURIComponent(liveSong.artist + ' ' + liveSong.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-[#1DB954]" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.892-.98-.336.075-.67-.136-.746-.472-.075-.337.136-.67.472-.746 3.856-.88 7.15-.502 9.814 1.13.295.18.387.563.207.86zm1.223-2.72c-.226.367-.71.487-1.078.26-2.72-1.672-6.87-2.157-10.076-1.185-.41.124-.844-.106-.968-.517-.124-.41.106-.844.517-.968 3.67-1.11 8.24-.57 11.346 1.34.368.227.488.71.26 1.077zm.106-2.82c-3.26-1.937-8.644-2.116-11.75-1.173-.5.15-1.025-.133-1.177-.633-.15-.5.133-1.025.633-1.177 3.593-1.09 9.537-.883 13.295 1.348.45.267.6.845.333 1.294-.267.45-.845.6-1.294.333z"/>
                      </svg>
                      <span>Search on Spotify</span>
                    </a>

                    {/* Search on Apple Music */}
                    <a
                      href={`https://music.apple.com/search?term=${encodeURIComponent(liveSong.artist + ' ' + liveSong.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-[#fc3c44]" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1.604 12.188V8.678l4.437 1.018v1.731l-4.437-1.016v3.777c0 1.258-1.218 1.944-2.164 1.625-.944-.316-1.408-1.353-.96-2.138.448-.785 1.547-.905 2.164-.627V8.163c0-.124.085-.236.207-.263l4.99-.997c.143-.028.272.079.272.225v2.858c0 .123-.085.235-.207.261l-4.302.986v4.6c0 1.258-1.218 1.944-2.164 1.625-.944-.316-1.408-1.353-.96-2.138.448-.785 1.547-.905 2.164-.627z"/>
                      </svg>
                      <span>Search on Apple Music</span>
                    </a>

                    {/* Search on YouTube */}
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(liveSong.artist + ' ' + liveSong.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-[#FF0000]" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span>Search on YouTube</span>
                    </a>
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="aspect-video relative rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Music className="h-8 w-8 text-indigo-500/40 mb-3" />
                <p className="text-xs font-semibold text-slate-400">Song metadata is unavailable</p>
                <p className="text-[10px] text-slate-600 mt-1">Please try again in a few moments.</p>
              </div>
            )}
          </AnimatePresence>

          {/* Status Indicator */}
          {!isLoading && liveSong && (
            <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <span className={`h-1.5 w-1.5 rounded-full ${loadMethod === 'api' ? 'bg-indigo-500' : 'bg-amber-500'}`} />
              <span>
                {loadMethod === 'api' 
                  ? 'Retrieved live from production feed: https://harmonix-api.vercel.app/api/today' 
                  : 'Displaying offline-seeded mathematical recovery track'
                }
              </span>
            </div>
          )}

        </motion.div>

        {/* 📚 Accordion Component - API Documentation Portal */}
        <div className="mt-12 pt-8 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Developer Integration Portal</span>
          </div>
          
          <div className="space-y-2">
            {faqItems.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-zinc-900/40 rounded-xl border border-white/5 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-slate-200 hover:text-white transition duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-white/5 bg-black/20"
                      >
                        <div className="p-4 text-xs text-slate-400 leading-relaxed font-sans">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* Modern Footer with Social Channels */}
      <footer className="mt-20 border-t border-white/5 py-8 text-center bg-black/40 space-y-4">
        <p className="text-[11px] text-slate-600 select-none">
          © {new Date().getFullYear()} Harmonix Initiative. Dedicated daily music curation, completely free.
        </p>
        <div className="flex justify-center items-center gap-3">
          {/* Buy me a coffee */}
          <a
            href="https://buymeacoffee.com/tugay"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 rounded-lg border border-amber-500/20 transition hover:scale-[1.05]"
            aria-label="Buy me a coffee"
            title="Buy me a coffee"
          >
            <span className="text-sm">☕</span>
          </a>

          {/* GitHub Repository */}
          <a
            href="https://github.com/Tugay72/harmonix-api"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/5 transition hover:scale-[1.05]"
            aria-label="GitHub Repository"
            title="GitHub Repository"
          >
            <CircleSlashOverride />
          </a>

          {/* Twitter / X */}
          <a
            href="https://x.com/_DevDelta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/5 transition hover:scale-[1.05]"
            aria-label="Twitter / X"
            title="Twitter / X"
          >
            <Twitter className="h-4 w-4 text-sky-400" />
          </a>
        </div>
      </footer>

    </main>
  );
}

// Small subcomponent or explicit declaration for the clean Github icon link integration
function CircleSlashOverride() {
  return <Github className="h-4 w-4 text-indigo-400" />;
}