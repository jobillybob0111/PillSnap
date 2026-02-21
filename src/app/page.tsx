'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Sun, Moon, Camera, X, Loader2, Cross, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackgroundSymbols } from '@/components/BackgroundSymbols';
import { TrustBadge } from '@/components/TrustBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingScreen } from '@/components/LoadingScreen';
import { cn } from '@/lib/utils';

const COLORS = [
  'White', 'Beige', 'Black', 'Blue', 'Brown', 'Clear', 'Gold', 'Gray', 'Green',
  'Maroon', 'Orange', 'Peach', 'Pink', 'Purple', 'Red', 'Tan', 'Yellow',
  'Beige & Red', 'Black & Green', 'Blue & Brown', 'Blue & White', 'Brown & Orange',
  'Gray & Peach', 'Green & White', 'Pink & White', 'Red & White', 'White & Yellow', 'Yellow & White',
];

const SHAPES = [
  'Barrel', 'Capsule/Oblong', 'Character-shape', 'Egg-shape', 'Eight-sided', 'Oval',
  'Figure eight-shape', 'Five-sided', 'Four-sided', 'Heart-shape', 'Kidney-shape',
  'Rectangle', 'Round', 'Seven-sided', 'Six-sided', 'Three-sided', 'U-shape',
];

interface MatchResult {
  drug_name: string;
  generic_name: string;
  strength: string;
  drug_class: string;
  uses: string;
  image_url: string | null;
  confidence: number;
  imprint?: string;
  color?: string;
  shape?: string;
}

interface IdentifyResponse {
  imprint: string;
  searchColor?: string;
  searchShape?: string;
  results: MatchResult[];
  potentialMatches?: MatchResult[];
  disclaimer: string;
}

function ConfidenceBar({ score }: { score: number }) {
  const variant = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';
  const width = Math.min(100, Math.max(0, score));
  return (
    <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          'h-full rounded-full',
          variant === 'success' && 'bg-emerald-500',
          variant === 'warning' && 'bg-amber-500',
          variant === 'danger' && 'bg-rose-500'
        )}
      />
    </div>
  );
}

function ConfidenceBadge({ score }: { score: number }) {
  const variant = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';
  return (
    <Badge variant={variant} className="shrink-0">
      {score}% match
    </Badge>
  );
}

function ResultPillImage({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const fullUrl = imageUrl.startsWith('http') ? imageUrl : `https://www.drugs.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  const src = fullUrl.includes('drugs.com') ? `/api/image?url=${encodeURIComponent(fullUrl)}` : fullUrl;
  if (failed) {
    return <span className="text-xs text-muted-foreground">Unavailable</span>;
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-contain"
      onError={() => setFailed(true)}
    />
  );
}

function getPotentialMatchDifference(
  r: { color?: string; shape?: string },
  searchColor?: string,
  searchShape?: string
): string {
  const norm = (s: string) => (s || '').toLowerCase().trim();
  const colorMatches = (a: string, b: string) => {
    if (!a) return true;
    const x = norm(a);
    const y = norm(b || '');
    return x === y || y.includes(x) || x.includes(y);
  };
  const shapeMatches = (a: string, b: string) => {
    if (!a) return true;
    const x = norm(a);
    const y = norm(b || '');
    if (x === y) return true;
    const xTerms = x.split(/[/\s-,]+/).filter(Boolean);
    const yTerms = y.split(/[/\s-,]+/).filter(Boolean);
    return xTerms.some((t) => y.includes(t)) || yTerms.some((t) => x.includes(t));
  };
  const parts: string[] = [];
  if (searchColor && !colorMatches(searchColor, r.color || '')) {
    parts.push(`color (this pill is ${r.color || 'unknown'})`);
  }
  if (searchShape && !shapeMatches(searchShape, r.shape || '')) {
    parts.push(`shape (this pill is ${r.shape || 'unknown'})`);
  }
  if (parts.length === 0) return '';
  return `Different ${parts.join(' and ')}.`;
}

export default function Home() {
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [imprint, setImprint] = useState('');
  const [color, setColor] = useState('');
  const [shape, setShape] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResponse | null>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraSlot, setCameraSlot] = useState<'front' | 'back' | null>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const imprintInputRef = useRef<HTMLInputElement>(null);
  const suggestListRef = useRef<HTMLUListElement>(null);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('pillsnap-theme');
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    const q = imprint.trim();
    if (q.length < 1) {
      setSuggestions([]);
      setSuggestOpen(false);
      return;
    }
    const t = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`);
        const data = await res.json().catch(() => ({}));
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        if (!justSelectedRef.current) setSuggestOpen(true);
        justSelectedRef.current = false;
        setSelectedIndex(0);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [imprint]);

  const selectSuggestion = (s: string) => {
    justSelectedRef.current = true;
    setImprint(s);
    setSuggestOpen(false);
    setSuggestions([]);
    imprintInputRef.current?.focus();
  };

  const handleImprintKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && suggestions[selectedIndex] != null) {
      e.preventDefault();
      selectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setSuggestOpen(false);
    }
  };

  useEffect(() => {
    if (!suggestOpen || !suggestListRef.current) return;
    const el = suggestListRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, suggestOpen]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('pillsnap-theme', next ? 'dark' : 'light');
  };

  const startCamera = async (slot: 'front' | 'back') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraSlot(slot);
      setCameraActive(true);
    } catch {
      setError('Camera access denied or unavailable.');
    }
  };

  const captureFromCamera = () => {
    if (!videoRef.current || !cameraSlot) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const file = new File([blob], `pill-${cameraSlot}.jpg`, { type: 'image/jpeg' });
        if (cameraSlot === 'front') {
          setFrontPreview(url);
          setFrontFile(file);
        } else {
          setBackPreview(url);
          setBackFile(file);
        }
      }
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
    setCameraSlot(null);
  };

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (s: string | null) => void,
    setFile: (f: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFile(file);
    } else {
      setPreview(null);
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const hasImprint = imprint.trim().length > 0;
    if (!hasImprint) {
      setError('Please enter the pill imprint (letters/numbers on the pill).');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      if (frontFile) formData.append('front', frontFile);
      if (backFile) formData.append('back', backFile);
      formData.append('imprint', imprint.trim());
      formData.append('color', color);
      formData.append('shape', shape);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const res = await fetch('/api/identify', { method: 'POST', body: formData, signal: controller.signal });
      clearTimeout(timeout);
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        setError('Server returned an invalid response. Please try again.');
        return;
      }
      let data: IdentifyResponse & { error?: string; message?: string };
      try {
        data = await res.json();
      } catch {
        setError('Invalid response. Try again.');
        return;
      }
      if (!res.ok) {
        if (data.error === 'NO_IMPRINT') setError('Please enter the pill imprint.');
        else if (data.error === 'NO_MATCHES') setError('No matching pills found. Try different imprint, color, or shape.');
        else setError(data.message || 'Something went wrong.');
        return;
      }
      setResult(data);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') setError('Request timed out. Try again.');
        else if (err.message?.includes('Failed to fetch')) setError('Cannot reach the server. Make sure the app is running.');
        else setError('Network error. Please try again.');
      } else setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      {/* Floating gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute -top-40 -right-40 h-80 w-80 bg-blue-400/30" />
        <div className="blob absolute top-1/2 -left-40 h-72 w-72 bg-sky-300/25" />
        <div className="blob absolute -bottom-20 right-1/3 h-64 w-64 bg-blue-200/20" />
      </div>
      <BackgroundSymbols />
      {/* Subtle grid */}
      <div className="fixed inset-0 bg-grid-subtle pointer-events-none opacity-50" />

      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-90 transition-opacity">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white">
              <Pill className="h-4 w-4" strokeWidth={2} />
              <Cross className="absolute bottom-1 right-1 h-2 w-2 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-semibold tracking-tight">PillSnap</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="h-9 w-9 rounded-lg p-0"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </nav>
        </div>
      </header>

      <main className="relative flex-1 mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            PillSnap
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Identify medications safely and instantly.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload card - glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Card className="glass border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Upload & details</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Optional photos. Identification is based on the imprint you enter below.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Front</label>
                    <div
                      onClick={() => frontRef.current?.click()}
                      className="flex h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-[hsl(var(--primary))]/50 hover:bg-muted/60"
                    >
                      {frontPreview ? (
                        <img src={frontPreview} alt="Front" className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        <span className="text-sm text-muted-foreground">Click to upload</span>
                      )}
                    </div>
                    <input ref={frontRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, setFrontPreview, setFrontFile)} />
                    <div className="mt-2 flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => startCamera('front')}>
                        <Camera className="mr-1 h-3.5 w-3.5" /> Camera
                      </Button>
                      {frontPreview && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => { setFrontPreview(null); setFrontFile(null); }}>
                          <X className="h-3.5 w-3.5" /> Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Back</label>
                    <div
                      onClick={() => backRef.current?.click()}
                      className="flex h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-[hsl(var(--primary))]/50 hover:bg-muted/60"
                    >
                      {backPreview ? (
                        <img src={backPreview} alt="Back" className="h-full w-full object-cover rounded-xl" />
                      ) : (
                        <span className="text-sm text-muted-foreground">Click to upload</span>
                      )}
                    </div>
                    <input ref={backRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e, setBackPreview, setBackFile)} />
                    <div className="mt-2 flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => startCamera('back')}>
                        <Camera className="mr-1 h-3.5 w-3.5" /> Camera
                      </Button>
                      {backPreview && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => { setBackPreview(null); setBackFile(null); }}>
                          <X className="h-3.5 w-3.5" /> Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="imprint" className="mb-1.5 block text-sm font-medium text-foreground">Pill imprint (required)</label>
                  <Input
                    ref={imprintInputRef}
                    id="imprint"
                    type="text"
                    autoComplete="off"
                    value={imprint}
                    onChange={(e) => setImprint(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setSuggestOpen(true)}
                    onBlur={() => setTimeout(() => setSuggestOpen(false), 180)}
                    onKeyDown={handleImprintKeyDown}
                    placeholder="e.g. L484, lupin 20"
                    className="w-full"
                  />
                  {suggestOpen && (suggestions.length > 0 || suggestLoading) && (
                    <ul
                      ref={suggestListRef}
                      role="listbox"
                      className="absolute top-full left-0 right-0 z-20 mt-1 max-h-52 overflow-auto rounded-xl border border-border bg-card py-1 shadow-soft"
                    >
                      {suggestLoading && (
                        <li className="px-4 py-2 text-sm text-muted-foreground">Loading…</li>
                      )}
                      {!suggestLoading && suggestions.map((s, i) => (
                        <li
                          key={s}
                          data-index={i}
                          role="option"
                          aria-selected={i === selectedIndex}
                          onClick={() => selectSuggestion(s)}
                          onMouseDown={(e) => e.preventDefault()}
                          className={cn(
                            'cursor-pointer px-4 py-2.5 text-sm transition-colors',
                            i === selectedIndex ? 'bg-[hsl(var(--primary))] text-white' : 'hover:bg-muted'
                          )}
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="color" className="mb-1.5 block text-sm font-medium text-muted-foreground">Color (optional)</label>
                    <select
                      id="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2"
                    >
                      <option value="">Any color</option>
                      {COLORS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="shape" className="mb-1.5 block text-sm font-medium text-muted-foreground">Shape (optional)</label>
                    <select
                      id="shape"
                      value={shape}
                      onChange={(e) => setShape(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2"
                    >
                      <option value="">Any shape</option>
                      {SHAPES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-blue-600 hover:opacity-95 text-base font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Identifying…
                    </span>
                  ) : (
                    'Identify Pill'
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
            >
              {error}
            </motion.div>
          )}
        </form>

        {/* Full-screen loading */}
        <AnimatePresence mode="wait">
          {loading && <LoadingScreen key="loading-screen" />}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mt-10 space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-foreground">Results</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Matched imprint: <strong>{result.imprint}</strong>
                  {(result.searchColor || result.searchShape) && (
                    <span className="ml-2">• {[result.searchColor, result.searchShape].filter(Boolean).join(', ')}</span>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {result.results.length === 0 && (result.potentialMatches?.length ?? 0) > 0
                    ? 'No exact match for your color/shape. See potential matches below.'
                    : 'Reference images from our data source.'}
                </p>
              </div>

              {result.results.length > 0 && (
                <div className="space-y-4">
                  {result.results.map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      <Card className="overflow-hidden border-l-4 border-l-[hsl(var(--primary))] shadow-soft">
                        <div className="grid grid-cols-[auto_1fr] gap-6 p-6">
                          <div className="flex gap-4">
                            {(frontPreview || backPreview) && (
                              <div className="text-center">
                                <div className="h-28 w-28 overflow-hidden rounded-xl border border-border bg-muted flex items-center justify-center">
                                  <img src={frontPreview || backPreview!} alt="Your pill" className="h-full w-full object-contain" />
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">Your upload</p>
                              </div>
                            )}
                            <div className="text-center">
                              <div className="h-28 w-28 overflow-hidden rounded-xl border border-border bg-muted flex items-center justify-center">
                                {r.image_url ? (
                                  <ResultPillImage imageUrl={r.image_url} alt={`${r.drug_name}`} />
                                ) : (
                                  <span className="text-xs text-muted-foreground">Unavailable</span>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">Reference</p>
                            </div>
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-bold text-foreground">{r.drug_name}</h3>
                              <span className="flex items-center gap-1.5 shrink-0 rounded-md border border-border bg-card px-2 py-0.5 ring-1 ring-[hsl(var(--primary))]/20 shadow-sm">
                                <Shield className="h-3.5 w-3.5 text-[hsl(var(--primary))]" strokeWidth={2} />
                                <ConfidenceBadge score={r.confidence} />
                              </span>
                              <ConfidenceBar score={r.confidence} />
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{r.generic_name} • {r.strength}</p>
                            {(r.imprint || r.color || r.shape) && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Imprint: {r.imprint || '—'} • Color: {r.color || '—'} • Shape: {r.shape || '—'}
                              </p>
                            )}
                            <p className="mt-3 text-sm"><strong>Class:</strong> {r.drug_class}</p>
                            <p className="mt-1 text-sm"><strong>Common uses:</strong> {r.uses}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {(result.potentialMatches?.length ?? 0) > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Potential matches</h3>
                  <p className="text-sm text-muted-foreground">
                    Same imprint, different color or shape. Double-check appearance.
                  </p>
                  {result.potentialMatches!.map((r, i) => {
                    const diff = getPotentialMatchDifference(r, result.searchColor, result.searchShape);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.1, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                      >
                        <Card className="border-amber-200/50 dark:border-amber-900/50 overflow-hidden">
                          <div className="grid grid-cols-[auto_1fr] gap-6 p-6">
                            <div className="text-center">
                              <div className="h-28 w-28 overflow-hidden rounded-xl border border-border bg-muted flex items-center justify-center">
                                {r.image_url ? (
                                  <ResultPillImage imageUrl={r.image_url} alt={`${r.drug_name}`} />
                                ) : (
                                  <span className="text-xs text-muted-foreground">Unavailable</span>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">Reference</p>
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-lg font-bold text-foreground">{r.drug_name}</h3>
                                <span className="flex items-center gap-1.5">
                                  <Shield className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                                  <ConfidenceBadge score={r.confidence} />
                                </span>
                              </div>
                              {diff && (
                                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{diff}</p>
                              )}
                              <p className="mt-1 text-sm text-muted-foreground">{r.generic_name} • {r.strength}</p>
                              <p className="mt-3 text-sm"><strong>Class:</strong> {r.drug_class}</p>
                              <p className="mt-1 text-sm"><strong>Common uses:</strong> {r.uses}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <TrustBadge />

              <Card className="border-border/60 bg-muted/30">
                <CardContent className="py-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Disclaimer:</strong> {result.disclaimer}
                  </p>
                </CardContent>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Camera modal */}
      <AnimatePresence>
        {cameraActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          >
            <video ref={videoRef} autoPlay playsInline className="max-h-[70vh] w-auto rounded-2xl" />
            <div className="mt-6 flex gap-3">
              <Button onClick={captureFromCamera}>Capture</Button>
              <Button variant="outline" onClick={stopCamera}>Cancel</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
