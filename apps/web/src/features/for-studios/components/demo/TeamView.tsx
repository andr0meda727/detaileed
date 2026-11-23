import { useMemo, useState } from 'react';
import { Mail, RefreshCw, Trash2, UserPlus, Users } from 'lucide-react';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, SearchInput } from '@detaileed/ui';
import { MOCK_EMPLOYEES } from '../../model/demoData';
import { DemoHeader } from './DemoHeader';

/** The demo's team screen: the studio's people with their roles. */
export function TeamView() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_EMPLOYEES.filter((e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="space-y-6">
      <DemoHeader title="Zespół" subtitle="Zarządzaj pracownikami w studiu" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          aria-label="Szukaj osoby"
          placeholder="Szukaj osoby..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery('')}
          wrapperClassName="sm:w-80"
        />
        <Button variant="secondary" icon={UserPlus}>
          Zaproś do zespołu
        </Button>
      </div>

      <Card>
        <CardHeader
          titleAs="h4"
          title={
            <span className="flex items-center gap-2">
              Kadra pracownicza
              <span className="font-mono text-xs font-normal text-faint tabular-nums">
                {MOCK_EMPLOYEES.length} osób
              </span>
            </span>
          }
          actions={<Button variant="ghost" size="sm" icon={RefreshCw} aria-label="Odśwież listę" />}
        />
        {filtered.length === 0 ? (
          <EmptyState icon={Users} message="Nie znaleziono osób." />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((emp) => (
              <li
                key={emp.userId}
                className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={emp.name} decorative />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{emp.name}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail size={12} strokeWidth={1.75} className="shrink-0 text-faint" aria-hidden />
                      <span className="truncate">{emp.email}</span>
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 pl-11 sm:pl-0">
                  <Badge tone={emp.tone}>{emp.role}</Badge>
                  <Button variant="ghost" size="sm" icon={Trash2} aria-label={`Usuń pracownika: ${emp.name}`} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
