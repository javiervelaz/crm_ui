import { useState } from 'react';

export default function DatePicker({ label, value, onChange }) {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateChange = (e) => {
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
        className="border border-gray-300 rounded-md px-3 py-2 w-full shadow-sm focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
