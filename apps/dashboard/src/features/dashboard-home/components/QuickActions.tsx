import React from 'react';
import { Calendar, Package, Car as CarIcon, User } from 'lucide-react';

interface QuickActionsProps {
  onNewBooking: () => void;
  onNewClient: () => void;
  onNewVehicle: () => void;
  onOpenInventory: () => void;
}

/** Shortcuts: new booking, client and vehicle, and the inventory. */
const QuickActions: React.FC<QuickActionsProps> = ({ onNewBooking, onNewClient, onNewVehicle, onOpenInventory }) => {
  return (
    <div className="floating-card-static p-6 sm:p-7">
      <h4 className="text-lg font-sans font-bold text-green-deep mb-5">Szybkie Akcje</h4>
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: 'Nowa Rezerwacja',
            icon: Calendar,
            action: onNewBooking,
            style: { background: 'linear-gradient(135deg, var(--green-deep) 0%, #2d4f33 100%)', color: 'var(--cream)' },
            iconColor: '#e8a830',
          },
          {
            label: 'Nowy Klient',
            icon: User,
            action: onNewClient,
            style: { background: 'linear-gradient(135deg, var(--amber) 0%, #d4941c 100%)', color: 'var(--green-deep)' },
            iconColor: '#1a2e1e',
          },
          {
            label: 'Nowy Pojazd',
            icon: CarIcon,
            action: onNewVehicle,
            style: {
              background: 'linear-gradient(135deg, var(--green-light) 0%, #2d5235 100%)',
              color: 'var(--cream)',
            },
            iconColor: '#c8e6be',
          },
          {
            label: 'Magazyn',
            icon: Package,
            action: onOpenInventory,
            style: {
              background: 'linear-gradient(135deg, #f0ebe0 0%, #e8e0d0 100%)',
              color: 'var(--green-deep)',
              border: '1px solid rgba(26,46,30,0.1)',
            },
            iconColor: '#3d6b46',
          },
        ].map((qa, i) => (
          <button
            key={i}
            onClick={qa.action}
            className="p-4 rounded-2xl flex flex-col items-center gap-2.5 transition-all active:scale-95 hover:-translate-y-1 hover:shadow-lg duration-200"
            style={qa.style}
          >
            <qa.icon size={22} strokeWidth={2} color={qa.iconColor} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{qa.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
