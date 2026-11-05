import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, Droplets, Footprints, Moon, Scale, X } from "lucide-react";
import { useLocale } from "../lib/locale";

function useModal(onClose: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);
}

function Shell({ children, onClose, label }: { children: ReactNode; onClose: () => void; label: string }) {
  const { tr } = useLocale();
  useModal(onClose);
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal quick-modal" role="dialog" aria-modal="true" aria-label={tr(label)}>
        <button className="modal-close" onClick={onClose} aria-label={tr("Close")}><X /></button>
        {children}
      </div>
    </div>
  );
}

export function WaterModal({
  current,
  target,
  onClose,
  onSave,
}: {
  current: number;
  target: number;
  onClose: () => void;
  onSave: (water: number) => void;
}) {
  const [water, setWater] = useState(current);
  const { tr } = useLocale();
  return (
    <Shell onClose={onClose} label="Log water">
      <span className="modal-mark blue"><Droplets /></span>
      <span className="eyebrow">{tr("HYDRATION")}</span>
      <h2>{tr("Add a glass of water.")}</h2>
      <p>{tr("One glass is about 250 ml. Thirst and pale-yellow urine are useful everyday cues.")}</p>
      <div className="water-visual" aria-hidden="true">
        {Array.from({ length: Math.max(target, 8) }, (_, index) => (
          <button key={index} className={index < water ? "filled" : ""} onClick={() => setWater(index + 1)} aria-label={`${tr("Set water to")} ${index + 1} ${tr("glasses")}`}><Droplets /></button>
        ))}
      </div>
      <div className="water-picker">
        <button onClick={() => setWater(Math.max(0, water - 1))} aria-label={tr("Remove one glass")}>−</button>
        <b>{water}<small>{tr("of")} {target} {tr("glasses")}</small></b>
        <button onClick={() => setWater(Math.min(30, water + 1))} aria-label={tr("Add one glass")}>+</button>
      </div>
      <div className="quick-value-row">
        <button className="soft-btn" onClick={() => { onSave(water + 1); onClose(); }}><Droplets /> +1 {tr("glass")}</button>
        <button className="soft-btn" onClick={() => { onSave(water + 2); onClose(); }}><Droplets /> +2 {tr("glasses")}</button>
      </div>
      <button className="primary-btn wide" onClick={() => { onSave(water); onClose(); }}><Check /> {tr("Save")} {water} {tr("glasses")}</button>
    </Shell>
  );
}

export function ValueModal({
  title,
  eyebrow,
  description,
  icon,
  unit,
  initial,
  step = 1,
  min = 0,
  max = 100000,
  presets,
  onClose,
  onSave,
}: {
  title: string;
  eyebrow: string;
  description: string;
  icon: "steps" | "sleep" | "weight" | "note";
  unit: string;
  initial: number;
  step?: number;
  min?: number;
  max?: number;
  presets?: number[];
  onClose: () => void;
  onSave: (value: number) => void;
}) {
  const { tr } = useLocale();
  const [value, setValue] = useState(initial ? String(initial) : "");
  const Icon = icon === "steps" ? Footprints : icon === "sleep" ? Moon : icon === "weight" ? Scale : Footprints;
  const parsed = Number(value);
  const valid = Number.isFinite(parsed) && parsed >= min && parsed <= max;
  const presetList = useMemo(() => presets || [], [presets]);

  return (
    <Shell onClose={onClose} label={tr(title)}>
      <span className="modal-mark"><Icon /></span>
      <span className="eyebrow">{tr(eyebrow)}</span>
      <h2>{tr(title)}</h2>
      <p>{tr(description)}</p>
      <label className="big-value-input">
        <input
          autoFocus
          inputMode="decimal"
          value={value}
          onChange={(event) => setValue(event.target.value.replace(/[^\d.]/g, ""))}
          placeholder="0"
          step={step}
          min={min}
          max={max}
        />
        <span>{unit}</span>
      </label>
      {presetList.length > 0 && (
        <div className="quick-chips">
          {presetList.map((preset) => (
            <button key={preset} onClick={() => setValue(String(preset))}>{preset.toLocaleString()} {unit}</button>
          ))}
        </div>
      )}
      <button className="primary-btn wide" disabled={!valid} onClick={() => { if (valid) { onSave(parsed); onClose(); } }}><Check /> {tr("Save")}</button>
    </Shell>
  );
}

export function ConfirmModal({
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { tr } = useLocale();
  return (
    <Shell onClose={onClose} label={tr(title)}>
      <span className="modal-mark warning"><Scale /></span>
      <span className="eyebrow">{tr("PLEASE CONFIRM")}</span>
      <h2>{tr(title)}</h2>
      <p>{tr(description)}</p>
      <div className="confirm-actions">
        <button className="soft-btn" onClick={onClose}>{tr("Cancel")}</button>
        <button className="danger-btn" onClick={() => { onConfirm(); onClose(); }}>{tr(confirmLabel)}</button>
      </div>
    </Shell>
  );
}
