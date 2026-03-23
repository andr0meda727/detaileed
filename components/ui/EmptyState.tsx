import React from 'react';
import { LucideIcon, SearchX } from 'lucide-react';

interface EmptyStateProps {
 message?: string;
 icon?: LucideIcon;
 className?: string;
}

/** Shown when a list/table has no items to display. */
const EmptyState: React.FC<EmptyStateProps> = ({
 message = 'Brak danych',
 icon: Icon = SearchX,
 className = '',
}) => (
 <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
 <Icon size={32} className="text-slate-200 mb-4" />
 <p className="text-sm text-slate-300 font-semibold">{message}</p>
 </div>
);

export default EmptyState;
