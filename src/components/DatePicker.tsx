import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, addDays } from 'date-fns';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Select date',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);

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
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array(firstDayOfWeek).fill(null);

  const handleDateSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const quickActions = [
    { label: 'Today', action: () => handleDateSelect(new Date()) },
    { label: 'Tomorrow', action: () => handleDateSelect(addDays(new Date(), 1)) },
    { label: 'Next Week', action: () => handleDateSelect(addDays(new Date(), 7)) },
  ];

  if (disabled) {
    return (
      <div className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl text-textSecondary cursor-not-allowed opacity-50">
        {value ? format(value, 'MMM dd, yyyy') : placeholder}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-background border border-border rounded-xl text-text hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all flex items-center justify-between group"
      >
        <span className={value ? 'text-text' : 'text-textSecondary'}>
          {value ? format(value, 'MMM dd, yyyy') : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {value && (
            <X 
              className="w-4 h-4 text-textSecondary hover:text-error transition-colors" 
              onClick={handleClear}
            />
          )}
          <Calendar className="w-4 h-4 text-textSecondary group-hover:text-primary transition-colors" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl z-50 animate-scale-in">
          {/* Quick Actions */}
          <div className="p-3 border-b border-border flex gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.action}
                className="px-3 py-1.5 text-sm bg-background hover:bg-primary/10 text-textSecondary hover:text-primary rounded-lg transition-all"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between p-3 border-b border-border">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-background rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-textSecondary" />
            </button>
            <span className="text-sm font-medium text-text">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-background rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-textSecondary" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-3">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-textSecondary py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {paddingDays.map((_, index) => (
                <div key={`padding-${index}`} className="aspect-square" />
              ))}
              {daysInMonth.map((day) => {
                const isSelected = value && isSameDay(day, value);
                const isTodayDate = isToday(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={`
                      aspect-square rounded-lg text-sm font-medium transition-all
                      ${isSelected 
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25' 
                        : isTodayDate
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : isCurrentMonth
                        ? 'text-text hover:bg-background'
                        : 'text-textSecondary/50'
                      }
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
