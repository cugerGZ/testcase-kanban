import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = '请选择',
  className = '',
}: SelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          appearance-none w-full px-4 py-2.5 pr-10
          bg-white border border-gray-300 rounded-lg
          text-sm text-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          cursor-pointer
          transition-colors
        "
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}
