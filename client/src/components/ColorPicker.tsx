import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const presetColors = [
  "#7c3aed", // Purple
  "#d946ef", // Pink
  "#ec4899", // Rose
  "#f43f5e", // Crimson
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#06b6d4", // Cyan
  "#0ea5e9", // Blue
  "#6366f1", // Indigo
  "#1e1b4b", // Dark
  "#ffffff", // White
];

export function ColorPicker({ value, onChange, label = "Cor" }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2 items-center">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 rounded cursor-pointer border border-border"
          />
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
          maxLength={7}
        />
      </div>
      
      <div className="grid grid-cols-6 gap-2">
        {presetColors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded border-2 transition-all ${
              value === color ? "border-foreground scale-110" : "border-border"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
