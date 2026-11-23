import { Download } from 'lucide-react';
import { Button, Card, CardContent, CardFooter, CardHeader, FormInput } from '@detaileed/ui';
import { DemoHeader } from './DemoHeader';

/** The demo's report export form. */
export function ReportsView() {
  return (
    <div className="space-y-6">
      <DemoHeader title="Raporty" subtitle="Eksport danych i analizy" />

      <Card className="max-w-3xl">
        <CardHeader title="Raport rezerwacji" titleAs="h4" description="Wygeneruj zestawienie finansowe wizyt." />
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput label="Data od" type="date" />
          <FormInput label="Data do" type="date" />
        </CardContent>
        <CardFooter>
          <Button icon={Download}>Pobierz raport</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
