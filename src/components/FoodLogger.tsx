import { useEffect, useMemo, useRef, useState } from "react";
import { Apple, Barcode, Camera, Check, LoaderCircle, Plus, Search, Sparkles, Utensils, X } from "lucide-react";
import type { Meal } from "../types";
import { FOODS, lookupBarcode, searchFoods, searchPackagedFoods, type ExternalFood, type Food } from "../data/foods";

function mealForNow(): Meal["type"] {
  const hour = new Date().getHours();
  if (hour < 11) return "Breakfast";
  if (hour < 15) return "Lunch";
  if (hour < 18) return "Snack";
  return "Dinner";
}

export default function FoodLogger({ onClose, onAdd, initialMeal }: { onClose: () => void; onAdd: (meal: Omit<Meal, "id">) => void; initialMeal?: Meal["type"] }) {
  const [tab, setTab] = useState<"search" | "quick" | "barcode" | "camera">("search");
  const [query, setQuery] = useState("");
  const [mealType, setMealType] = useState<Meal["type"]>(initialMeal || mealForNow);
  const [selected, setSelected] = useState<Food | null>(null);
  const [servings, setServings] = useState(1);
  const [remote, setRemote] = useState<ExternalFood[]>([]);
  const [searching, setSearching] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [barcode, setBarcode] = useState("");
  const [barcodeResult, setBarcodeResult] = useState<ExternalFood | null>(null);
  const [barcodeBusy, setBarcodeBusy] = useState(false);
  const [error, setError] = useState("");
  const [custom, setCustom] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });
  const inputRef = useRef<HTMLInputElement>(null);

  const local = useMemo(() => searchFoods(query, 14), [query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  useEffect(() => {
    if (query.trim().length < 3) {
      setRemote([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = window.setTimeout(async () => {
      const results = await searchPackagedFoods(query.trim());
      if (!cancelled) {
        setRemote(results);
        setSearching(false);
      }
    }, 650);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  function addFood(food: Food, multiplier = servings) {
    onAdd({
      type: mealType,
      name: food.name,
      quantity: food.serving,
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier * 10) / 10,
      carbs: Math.round(food.carbs * multiplier * 10) / 10,
      fat: Math.round(food.fat * multiplier * 10) / 10,
      fiber: Math.round((food.fiber || 0) * multiplier * 10) / 10,
      source: food.id.startsWith("off-") ? "barcode" : "database",
    });
    onClose();
  }

  async function findBarcode() {
    setError("");
    setBarcodeBusy(true);
    setBarcodeResult(null);
    const result = await lookupBarcode(barcode);
    setBarcodeBusy(false);
    if (!result) setError("No packaged food found for that barcode. Try the product name in Search, or use Quick add.");
    else setBarcodeResult(result);
  }

  async function startCamera() {
    try {
      setScanning(true);
      setScanResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
    } catch { setScanning(false); alert('Camera access failed'); }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function captureAndRecognize() {
    if (!videoRef.current || !canvasRef.current) return;
    setSearching(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    try {
      try {
        const resp = await fetch('/api/food-recognize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: dataUrl }) });
        if (resp.ok) {
          const data = await resp.json();
          if (data.ok && data.result) { setScanResult(data.result); stopCamera(); setScanning(false); setSearching(false); return; }
        }
      } catch {}
      const keys = ['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'];
      for (const key of keys) {
        try {
          const resp = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'nvidia/nemotron-nano-12b-v2-vl', messages: [{ role: 'user', content: [{ type: 'text', text: 'Identify this food. Return ONLY valid JSON: {"name":"","calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"serving":"100g","confidence":0.9}. Be accurate with Indian and global foods.' }, { type: 'image_url', image_url: { url: dataUrl } }] }], max_tokens: 300, temperature: 0.1 })
          });
          if (resp.ok) {
            const data = await resp.json();
            const text = data.choices?.[0]?.message?.content || '';
            const match = text.match(/\{[\s\S]*\}/);
            if (match) { const parsed = JSON.parse(match[0]); setScanResult(parsed); stopCamera(); setScanning(false); setSearching(false); return; }
          }
        } catch {}
      }
      alert('Could not identify food');
    } catch { alert('Recognition failed'); }
    setSearching(false);
  }

  function addScanned() {
    if (!scanResult) return;
    onAdd({
      type: mealType,
      name: scanResult.name || "Scanned food",
      calories: Math.round(scanResult.calories || 0),
      protein: Math.round((scanResult.protein || 0) * 10) / 10,
      carbs: Math.round((scanResult.carbs || 0) * 10) / 10,
      fat: Math.round((scanResult.fat || 0) * 10) / 10,
      fiber: Math.round((scanResult.fiber || 0) * 10) / 10,
      quantity: scanResult.serving || "1 serving",
      source: "database",
    });
    stopCamera();
    setScanning(false);
    setScanResult(null);
    onClose();
  }

  return (
    <div className="modal-backdrop food-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="food-modal" role="dialog" aria-modal="true" aria-label="Log food">
        <button className="modal-close" onClick={onClose} aria-label="Close food logger"><X /></button>
        <div className="food-head">
          <span className="modal-mark"><Apple /></span>
          <div>
            <span className="eyebrow">FOOD DIARY</span>
            <h2>What did you eat?</h2>
            <p>Estimates are fine. Consistency beats perfect numbers.</p>
          </div>
        </div>

        <div className="meal-type-row" role="group" aria-label="Meal type">
          {(["Breakfast", "Lunch", "Snack", "Dinner"] as const).map((type) => (
            <button key={type} className={mealType === type ? "active" : ""} onClick={() => setMealType(type)}>{type}</button>
          ))}
        </div>

        <div className="food-tabs" role="tablist">
          <button role="tab" aria-selected={tab === "search"} className={tab === "search" ? "active" : ""} onClick={() => setTab("search")}><Search /> Search</button>
          <button role="tab" aria-selected={tab === "quick"} className={tab === "quick" ? "active" : ""} onClick={() => setTab("quick")}><Plus /> Quick add</button>
          <button role="tab" aria-selected={tab === "barcode"} className={tab === "barcode" ? "active" : ""} onClick={() => setTab("barcode")}><Barcode /> Barcode</button>
          <button role="tab" aria-selected={tab === "camera"} className={tab === "camera" ? "active" : ""} onClick={() => setTab("camera")}><Camera /> AI Scan</button>
        </div>

        {tab === "search" && (
          <div className="food-search">
            {selected ? (
              <div className="food-selected">
                <button className="back-link" onClick={() => setSelected(null)}>← Back to results</button>
                <div className="food-selected-card">
                  <div>
                    <small>{selected.serving}</small>
                    <h3>{selected.name}</h3>
                    <p>{Math.round(selected.calories * servings)} kcal · {Math.round(selected.protein * servings)} g protein</p>
                  </div>
                  <label>
                    Servings
                    <span className="serving-stepper">
                      <button onClick={() => setServings(Math.max(0.5, servings - 0.5))} aria-label="Fewer servings">−</button>
                      <input type="number" min="0.25" max="10" step="0.25" value={servings} onChange={(event) => setServings(Math.max(0.25, Number(event.target.value) || 1))} />
                      <button onClick={() => setServings(Math.min(10, servings + 0.5))} aria-label="More servings">+</button>
                    </span>
                  </label>
                </div>
                <div className="food-macro-preview">
                  <span><b>{Math.round(selected.calories * servings)}</b> kcal</span>
                  <span><b>{Math.round(selected.protein * servings)}</b> g protein</span>
                  <span><b>{Math.round(selected.carbs * servings)}</b> g carbs</span>
                  <span><b>{Math.round(selected.fat * servings)}</b> g fat</span>
                </div>
                <button className="primary-btn wide" onClick={() => addFood(selected)}><Check /> Add {mealType.toLowerCase()}</button>
              </div>
            ) : (
              <>
                <label className="search-input">
                  <Search />
                  <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roti, dal, eggs, oats, paneer…" aria-label="Search foods" />
                  {query && <button onClick={() => setQuery("")} aria-label="Clear search"><X /></button>}
                </label>
                <div className="food-results">
                  <div className="result-heading"><span>Everyday foods</span><small>{local.length} results</small></div>
                  {local.map((food) => (
                    <button className="food-row" key={food.id} onClick={() => { setSelected(food); setServings(1); }}>
                      <span className="food-icon"><Utensils /></span>
                      <div><b>{food.name}</b><small>{food.serving}</small></div>
                      <strong>{food.calories}<small>kcal</small></strong>
                      <em>{food.protein}g P</em>
                    </button>
                  ))}
                  {!local.length && <p className="empty-line">No everyday match. Try the packaged search below or Quick add.</p>}
                </div>
                {query.trim().length >= 3 && (
                  <div className="food-results external">
                    <div className="result-heading">
                      <span>Packaged foods <small>Open Food Facts</small></span>
                      {searching && <LoaderCircle className="spin" />}
                    </div>
                    {remote.map((food) => (
                      <button className="food-row" key={food.id} onClick={() => { setSelected(food); setServings(1); }}>
                        <span className="food-icon packaged"><Barcode /></span>
                        <div><b>{food.name}</b><small>{food.serving} · {food.source === "open-food-facts" ? "Open Food Facts" : "Packaged"}</small></div>
                        <strong>{food.calories}<small>kcal</small></strong>
                        <em>{food.protein}g P</em>
                      </button>
                    ))}
                    {!searching && !remote.length && <p className="empty-line">No packaged match found. You can still quick-add it.</p>}
                  </div>
                )}
                <div className="popular-chips">
                  <span>Popular:</span>
                  {["roti", "dal", "eggs", "paneer", "oats", "banana"].map((id) => {
                    const food = FOODS.find((item) => item.id === id);
                    if (!food) return null;
                    return <button key={id} onClick={() => { setSelected(food); setServings(1); }}>{food.name}</button>;
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "quick" && (
          <form
            className="quick-food-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!custom.name.trim()) return;
              onAdd({
                type: mealType,
                name: custom.name.trim(),
                quantity: "1 serving",
                calories: Math.max(0, Number(custom.calories) || 0),
                protein: Math.max(0, Number(custom.protein) || 0),
                carbs: Math.max(0, Number(custom.carbs) || 0),
                fat: Math.max(0, Number(custom.fat) || 0),
                source: "manual",
              });
              onClose();
            }}
          >
            <label>Food name<input autoFocus value={custom.name} onChange={(event) => setCustom({ ...custom, name: event.target.value })} placeholder="e.g. Homemade vegetable soup" /></label>
            <div className="form-grid">
              <label>Calories<input type="number" min="0" value={custom.calories} onChange={(event) => setCustom({ ...custom, calories: event.target.value })} placeholder="250" /></label>
              <label>Protein (g)<input type="number" min="0" step="0.1" value={custom.protein} onChange={(event) => setCustom({ ...custom, protein: event.target.value })} placeholder="12" /></label>
              <label>Carbs (g)<input type="number" min="0" step="0.1" value={custom.carbs} onChange={(event) => setCustom({ ...custom, carbs: event.target.value })} placeholder="30" /></label>
              <label>Fat (g)<input type="number" min="0" step="0.1" value={custom.fat} onChange={(event) => setCustom({ ...custom, fat: event.target.value })} placeholder="8" /></label>
            </div>
            <button className="primary-btn wide" type="submit" disabled={!custom.name.trim()}><Plus /> Add {mealType.toLowerCase()}</button>
          </form>
        )}

        {tab === "camera" && (
          <div className="barcode-panel">
            <div className="barcode-icon"><Camera /></div>
            <h3>Snap & Recognize Food</h3>
            <p>AI powered by NVIDIA OCR/VLM - works with Indian & global foods</p>
            {!scanning && !scanResult && (
              <button className="primary-btn" onClick={() => { setTab("camera"); startCamera(); }}><Camera /> Open Camera</button>
            )}
            {scanning && !scanResult && (
              <div style={{width:'100%',display:'grid',gap:'12px'}}>
                <video ref={videoRef} autoPlay playsInline muted style={{width:'100%',borderRadius:'12px',background:'#000'}} />
                <canvas ref={canvasRef} style={{display:'none'}} />
                <button className="primary-btn" onClick={captureAndRecognize} disabled={searching}>
                  {searching ? <><LoaderCircle className="spin" /> Recognizing...</> : <><Sparkles /> Capture & Recognize</>}
                </button>
                <button className="soft-btn" onClick={() => { stopCamera(); setScanning(false); }}>Cancel</button>
              </div>
            )}
            {scanResult && (
              <div className="barcode-result" style={{width:'100%'}}>
                <h4>{scanResult.name}</h4>
                <p>{scanResult.serving} · {scanResult.calories} kcal · P:{scanResult.protein}g C:{scanResult.carbs}g F:{scanResult.fat}g</p>
                <div style={{display:'flex',gap:'8px'}}>
                  <button className="primary-btn" onClick={addScanned}><Check /> Add to {mealType.toLowerCase()}</button>
                  <button className="soft-btn" onClick={() => { setScanResult(null); startCamera(); }}>Scan Again</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "camera" && (
          <div className="barcode-panel">
            <div className="barcode-icon"><Camera /></div>
            <h3>Snap & Recognize Food</h3>
            <p>AI powered by NVIDIA VLM - Indian & global foods, real-time</p>
            {!scanning && !scanResult && (
              <button className="primary-btn" onClick={startCamera}><Camera /> Open Camera</button>
            )}
            {scanning && !scanResult && (
              <div style={{width:'100%',display:'grid',gap:'12px'}}>
                <video ref={videoRef} autoPlay playsInline muted style={{width:'100%',borderRadius:'12px',background:'#000'}} />
                <canvas ref={canvasRef} style={{display:'none'}} />
                <button className="primary-btn" onClick={captureAndRecognize} disabled={searching}>
                  {searching ? <><LoaderCircle className="spin" /> Recognizing...</> : <><Sparkles /> Capture & Recognize</>}
                </button>
                <button className="soft-btn" onClick={() => { stopCamera(); setScanning(false); }}>Cancel</button>
              </div>
            )}
            {scanResult && (
              <div className="barcode-result" style={{width:'100%'}}>
                <h4>{scanResult.name}</h4>
                <p>{scanResult.serving} · {scanResult.calories} kcal · P:{scanResult.protein}g C:{scanResult.carbs}g F:{scanResult.fat}g</p>
                <div style={{display:'flex',gap:'8px'}}>
                  <button className="primary-btn" onClick={addScanned}><Check /> Add to {mealType.toLowerCase()}</button>
                  <button className="soft-btn" onClick={() => { setScanResult(null); startCamera(); }}>Scan Again</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "barcode" && (
          <div className="barcode-panel">
            <div className="barcode-icon"><Barcode /></div>
            <h3>Type a barcode</h3>
            <p>Packaged-food data comes from Open Food Facts. Always check the label for allergens.</p>
            <div className="barcode-row">
              <input inputMode="numeric" value={barcode} onChange={(event) => setBarcode(event.target.value)} placeholder="e.g. 8901234567890" aria-label="Barcode number" />
              <button className="primary-btn" onClick={findBarcode} disabled={barcodeBusy || barcode.length < 6}>
                {barcodeBusy ? <LoaderCircle className="spin" /> : <Search />} Look up
              </button>
            </div>
            {error && <p className="form-error">{error}</p>}
            {barcodeResult && (
              <div className="barcode-result">
                <h4>{barcodeResult.name}</h4>
                <p>{barcodeResult.serving} · {barcodeResult.calories} kcal · {barcodeResult.protein} g protein</p>
                <button className="primary-btn" onClick={() => addFood(barcodeResult)}><Check /> Add {mealType.toLowerCase()}</button>
              </div>
            )}
          </div>
        )}

        <small className="food-disclaimer">Nutrition values are estimates. This is not medical or allergen advice.</small>
      </div>
    </div>
  );
}
