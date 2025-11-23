import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Select date' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
  };

  const quickDates = [
    { label: 'Today', date: new Date() },
    { label: 'Tomorrow', date: new Date(Date.now() + 86400000) },
    { label: 'Next Week', date: new Date(Date.now() + 7 * 86400000) },
  ];

  return (
    <div ref={containerRef} className="relative">
      {/* Input Field */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text cursor-pointer hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-textSecondary group-hover:text-primary transition-colors" />
          <span className={value ? 'text-text' : 'text-textSecondary'}>
            {value ? format(value, 'MMM d, yyyy') : placeholder}
          </span>
        </div>
        {value && (
          <button
            onClick={handleClear}
            className="p-1 hover:bg-surface rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-textSecondary hover:text-text" />
          </button>
        )}
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in">
          {/* Quick Select */}
          <div className="p-3 border-b border-border">
            <div className="flex gap-2">
              {quickDates.map((quick) => (
                <button
                  key={quick.label}
                  onClick={() => handleDateSelect(quick.date)}
                  className="flex-1 px-3 py-2 text-sm bg-background hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
                >
                  {quick.label}
                </button>
              ))}
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-background rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-textSecondary" />
            </button>
            <h3 className="text-base font-semibold text-text">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-background rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-textSecondary" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Week Days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-textSecondary py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = value && isSameDay(day, value);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day)}
                    disabled={!isCurrentMonth}
                    className={`
                      aspect-square p-2 text-sm rounded-lg transition-all
                      ${!isCurrentMonth && 'text-textSecondary/30 cursor-not-allowed'}
                      ${isCurrentMonth && !isSelected && !isTodayDate && 'text-text hover:bg-background'}
                      ${isTodayDate && !isSelected && 'bg-primary/10 text-primary font-semibold'}
                      ${isSelected && 'bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg'}
                      ${isCurrentMonth && !isSelected && 'hover:scale-105'}
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border flex justify-between items-center">
            <button
              onClick={() => handleDateSelect(new Date())}
              className="text-sm text-primary hover:text-accent transition-colors font-medium"
            >
              Today
            </button>
            <button
              onClick={handleClear}
              className="text-sm text-textSecondary hover:text-text transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
