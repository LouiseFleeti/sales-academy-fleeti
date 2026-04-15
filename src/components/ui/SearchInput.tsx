"use client";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export default function SearchInput({ value, onChange, placeholder = "Rechercher..." }: Props) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-fleeti-blue focus:border-transparent placeholder-gray-400"
      />
    </div>
  );
}
