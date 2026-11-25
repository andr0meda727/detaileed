import React from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@detaileed/ui';

interface ResetSentMessageProps {
  email: string;
  onBack: () => void;
}

export const ResetSentMessage: React.FC<ResetSentMessageProps> = ({ email, onBack }) => (
  <div className="flex flex-col items-center gap-4 text-center">
    <div className="flex size-11 items-center justify-center rounded-full bg-success-soft text-success">
      <CheckCircle2 className="size-5" strokeWidth={1.75} aria-hidden />
    </div>
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold tracking-tight">Sprawdź skrzynkę</h2>
      <p className="text-sm text-muted-foreground">
        Wysłaliśmy link resetujący na <strong className="font-medium text-foreground">{email}</strong>. Kliknij w link,
        aby ustawić nowe hasło.
      </p>
    </div>
    <Button variant="ghost" fullWidth icon={ArrowLeft} onClick={onBack}>
      Wróć do logowania
    </Button>
  </div>
);
