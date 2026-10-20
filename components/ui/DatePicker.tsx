import { useState } from 'react';

interface DatePickerProps {
  label?: string;
  value?: any;
  onChange: (value: any) => void;
}

export default function DatePicker({ label, value, onChange }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateChange = (e: any) => {
    onChange(e.target.value);
    setShowCalendar(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="date"
        value={value}
        onChange={handleDateChange}
        className="border border-gray-300 rounded-md px-3 py-2 w-full shadow-sm focus:ring-2 focus:ring-brand-600"
      />
    </div>
  );
}
