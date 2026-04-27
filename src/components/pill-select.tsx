"use client";

import { cn } from "@/lib/utils";

interface PillSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  label?: string;
}

export function PillSelect({ value, onChange, options, label }: PillSelectProps) {
  return (
    <div role="radiogroup" aria-label={label}>
      {label && <p className="mb-1.5 text-sm font-medium">{label}</p>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-full px-3 py-1 text-sm transition-all border",
              value === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
