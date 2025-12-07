import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { analyzeImage } from "../services/ai.js";
import { useCart } from "../context/CartContext.jsx";

export default function Home() {
  const heroRef = useRef(null);
  const uploadRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    gsap.fromTo(
      heroRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
    );
    gsap.fromTo(
      uploadRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, delay: 0.2, duration: 0.8, ease: "power3.out" },
    );
  }, []);

  const onFile = (f) => {
    if (!f) return;
    
    // Validate file type
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Validate file size (5MB limit)
    if (f.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(f);
    setError(null);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
    
    // Simulate upload progress
    setProgress(0);
    const tid = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(tid);
          return 100;
        }
        return p + 5;
      });
    }, 50);
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select an image first');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await analyzeImage(file);
      setResult(res);
      
      // Animate results
      gsap.from(".result-card", {
        y: 14,
        opacity: 0,
        stagger: 0.05,
        duration: 0.5,
      });
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="space-y-10">
      <section
        ref={heroRef}
        className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-fuchsia-500/15 via-orange-400/10 to-cyan-400/15 border border-[hsl(var(--border))]"
      >
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Personalized fashion, powered by AI.
          </h1>
          <p className="mt-3 text-lg opacity-80">
            Upload a clear photo and ShadeSense will analyze your face shape and
            skin tone to recommend sunglasses and colors that flatter you.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href="#upload"
              className="px-6 py-3 rounded-2xl font-extrabold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md hover:shadow-lg"
            >
              Try it now
            </a>
            <a
              href="#how"
              className="px-6 py-3 rounded-2xl font-semibold bg-white dark:bg-neutral-900 border border-[hsl(var(--border))]"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      <section
        id="upload"
        ref={uploadRef}
        className="grid lg:grid-cols-2 gap-8 items-start"
      >
        <div className="rounded-3xl p-6 border border-[hsl(var(--border))] bg-white dark:bg-neutral-900">
          <h2 className="text-2xl font-extrabold">Upload your photo</h2>
          <p className="opacity-80">
            Face forward photo with good lighting works best.
          </p>

          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          <label className="mt-5 block rounded-3xl border-2 border-dashed border-[hsl(var(--border))] bg-neutral-50 dark:bg-neutral-800/50 p-6 cursor-pointer hover:border-[hsl(var(--ring))] transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <div className="grid sm:grid-cols-[160px_1fr] gap-4 items-center">
              <div className="aspect-square w-full max-w-[160px] rounded-2xl bg-neutral-200/60 dark:bg-neutral-700/60 grid place-items-center overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="opacity-60">No image</span>
                )}
              </div>
              <div>
                <p className="font-semibold">Drag & drop or click to upload</p>
                <p className="text-sm opacity-70">JPG, PNG up to 5MB</p>
                
                {/* Progress bar */}
                <div className="mt-3 h-3 rounded-full bg-neutral-200 dark:bg-neutral-800">
                  <div
                    className="h-3 rounded-full bg-[hsl(var(--primary))] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="mt-4 flex gap-3 flex-wrap">
                  <button
                    onClick={handleAnalyze}
                    disabled={!file || loading}
                    className="px-5 py-3 rounded-2xl font-extrabold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] disabled:opacity-50 hover:shadow-lg transition-shadow"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span>
                        Analyzing with AI...
                      </span>
                    ) : (
                      "Analyze with AI"
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-5 py-3 rounded-2xl font-semibold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </label>
        </div>

        <div className="rounded-3xl p-6 border border-[hsl(var(--border))] bg-white dark:bg-neutral-900">
          <h2 className="text-2xl font-extrabold">Your analysis</h2>
          
          {loading && (
            <div className="mt-4 p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[hsl(var(--primary))] border-t-transparent mx-auto mb-4"></div>
              <p className="opacity-70">AI is analyzing your image...</p>
            </div>
          )}
          
          {!result && !loading && (
            <p className="opacity-70">
              {file ? 'Click "Analyze with AI" to see your results' : 'Upload a photo to get started'}
            </p>
          )}
          
          {result && (
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="result-card rounded-2xl p-4 bg-neutral-50 dark:bg-neutral-800/50">
                <p className="text-sm opacity-70">Face shape</p>
                <p className="text-xl font-extrabold capitalize">
                  {result.faceShape}
                </p>
              </div>
              <div className="result-card rounded-2xl p-4 bg-neutral-50 dark:bg-neutral-800/50">
                <p className="text-sm opacity-70">Skin tone</p>
                <p className="text-xl font-extrabold capitalize">
                  {result.skinTone}
                </p>
              </div>
              <div className="result-card rounded-2xl p-4 bg-neutral-50 dark:bg-neutral-800/50">
                <p className="text-sm opacity-70">Recommended colors</p>
                <div className="mt-2 flex gap-2">
                  {result.palettes?.map((hex) => (
                    <span
                      key={hex}
                      className="size-7 rounded-xl border"
                      style={{ background: hex }}
                      aria-label={hex}
                    />
                  ))}
                </div>
              </div>
              <div className="result-card rounded-2xl p-4 bg-neutral-50 dark:bg-neutral-800/50">
                <p className="text-sm opacity-70">Sunglasses styles</p>
                <p className="text-lg font-bold capitalize">
                  {result.sunglassesStyles?.join(", ") || "Not available"}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {result && result.recommendations && (
        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold">Top sunglasses for you</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {result.recommendations.sunglasses?.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)} />
            ))}
          </div>
          
          <h2 className="text-2xl font-extrabold mt-10">
            Outfits that match your palette
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {result.recommendations.outfits?.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
