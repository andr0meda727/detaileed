import React from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { Button, PageHeader } from '@detaileed/ui';

interface GlobalHeaderProps {
  title: string;
  subtitle: string;
  onAddBooking?: () => void;
  onAddClient?: () => void;
}

/** The top of a studio screen: its title, one line of description and the quick "new booking / client" actions. */
export const GlobalHeader: React.FC<GlobalHeaderProps> = ({ title, subtitle, onAddBooking, onAddClient }) => (
  <PageHeader
    className="mb-6"
    title={title}
    description={subtitle}
    actions={
      (onAddBooking || onAddClient) && (
        <>
          {onAddClient && (
            <Button variant={onAddBooking ? 'secondary' : 'primary'} icon={UserPlus} onClick={onAddClient}>
              Nowy klient
            </Button>
          )}
          {onAddBooking && (
            <Button icon={Plus} onClick={onAddBooking}>
              Nowa rezerwacja
            </Button>
          )}
        </>
      )
    }
  />
);
