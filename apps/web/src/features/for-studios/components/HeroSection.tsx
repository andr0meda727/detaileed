import { ArrowRight, Play } from 'lucide-react';
import { Badge, Button, cn } from '@detaileed/ui';
import { DASHBOARD_URL } from '@/shared/lib/site';
import { column } from './landingStyles';

/** The opening: what Detaileed is, a sign-up button and a jump to the demo. */
export function HeroSection() {
  return (
    <section className={cn(column, 'flex flex-col items-center pt-20 pb-16 text-center sm:pt-28 sm:pb-20')}>
      <Badge size="lg">Studio OS dla detailerów</Badge>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
        Zarządzaj studiem
        <br />
        <span className="text-muted-foreground">bez chaosu.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-base text-muted-foreground text-pretty sm:text-lg">
        Detaileed to wszystko czego potrzebujesz — rezerwacje, klienci, magazyn i finanse w jednym miejscu.
        Zaprojektowane specjalnie dla studiów detailingu.
      </p>
      <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
        <Button asChild size="lg">
          <a href={DASHBOARD_URL}>
            Zacznij za darmo
            <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
          </a>
        </Button>
        <Button asChild size="lg" variant="secondary" icon={Play}>
          <a href="#demo">Zobacz demo</a>
        </Button>
      </div>
    </section>
  );
}
