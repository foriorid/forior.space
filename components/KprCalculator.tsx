"use client";

import { useMemo, useState } from "react";

const rupiah = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");

/** Live KPR (mortgage) estimate — annuity formula, no submit button. */
export function KprCalculator({ price }: { price: number }) {
  const [harga, setHarga] = useState(price);
  const [dpPct, setDpPct] = useState(10);
  const [tenor, setTenor] = useState(15); // years
  const [bunga, setBunga] = useState(6); // % per year

  const { dp, cicilan } = useMemo(() => {
    const dp = (harga * dpPct) / 100;
    const pokok = Math.max(0, harga - dp);
    const r = bunga / 100 / 12;
    const n = Math.max(1, tenor * 12);
    const cicilan = r > 0 ? (pokok * r * (1 + r) ** n) / ((1 + r) ** n - 1) : pokok / n;
    return { dp, cicilan };
  }, [harga, dpPct, tenor, bunga]);

  return (
    <div className="glass mt-4 space-y-3 rounded-[26px] p-5">
      <div className="text-sm font-bold">Kalkulator KPR</div>

      <Field label="Harga Properti">
        <input
          inputMode="numeric"
          value={harga ? harga.toLocaleString("id-ID") : ""}
          onChange={(e) => setHarga(parseInt(e.target.value.replace(/\D/g, ""), 10) || 0)}
          className={inputCls}
        />
      </Field>

      <Slider label={`Uang Muka (DP) — ${dpPct}%`} value={dpPct} min={0} max={50} step={1} onChange={setDpPct} />
      <div className="-mt-1 text-xs text-[color:var(--muted)]">{rupiah(dp)}</div>

      <Slider label={`Tenor — ${tenor} tahun`} value={tenor} min={1} max={30} step={1} onChange={setTenor} />

      <Field label="Bunga (% / tahun)">
        <input
          inputMode="decimal"
          value={bunga}
          onChange={(e) => setBunga(parseFloat(e.target.value.replace(",", ".")) || 0)}
          className={inputCls}
        />
      </Field>

      <div className="rounded-2xl bg-accent/15 p-3.5">
        <div className="text-xs font-medium text-[color:var(--muted)]">Estimasi cicilan</div>
        <div className="text-2xl font-bold">
          {rupiah(cicilan)}
          <span className="text-sm font-semibold text-[color:var(--muted)]">/bln</span>
        </div>
      </div>
      <p className="text-[11px] leading-snug text-[color:var(--muted)]">
        Estimasi kasar, di luar pajak (BPHTB/AJB) & biaya KPR. Suku bunga aktual mengikuti bank.
      </p>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-surface/60 px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[color:var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[color:var(--muted)]">{label}</span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </label>
  );
}
