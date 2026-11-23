import React from 'react';
import { Calendar, Package, Car as CarIcon, User } from 'lucide-react';
import { Button, Card, CardContent, CardHeader } from '@detaileed/ui';

interface QuickActionsProps {
  onNewBooking: () => void;
  onNewClient: () => void;
  onNewVehicle: () => void;
  onOpenInventory: () => void;
}

/** Shortcuts: new booking, client and vehicle, and the inventory. */
export const QuickActions: React.FC<QuickActionsProps> = ({
  onNewBooking,
  onNewClient,
  onNewVehicle,
  onOpenInventory,
}) => {
  const actions = [
    { label: 'Nowa rezerwacja', icon: Calendar, action: onNewBooking },
    { label: 'Nowy klient', icon: User, action: onNewClient },
    { label: 'Nowy pojazd', icon: CarIcon, action: onNewVehicle },
    { label: 'Magazyn', icon: Package, action: onOpenInventory },
  ];

  return (
    <Card>
      <CardHeader title="Szybkie akcje" />
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map(({ label, icon, action }) => (
          <Button key={label} variant="secondary" icon={icon} onClick={action} className="justify-start">
            {label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
