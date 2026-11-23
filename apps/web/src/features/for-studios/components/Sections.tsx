import type { LucideIcon } from 'lucide-react';
import { Activity, ArrowRight, CalendarDays, Check, DollarSign, Package, Users } from 'lucide-react';
import { DASHBOARD_URL } from '@/shared/lib/site';
import { FEATURES, PRICING, STEPS, type FeatureId } from '../model/content';
import { FeatureMiniUi } from './FeatureMiniUis';
import { AppDemo } from './demo/AppDemo';

const FEATURE_ICONS: Record<FeatureId, LucideIcon> = {
  calendar: CalendarDays,
  crm: Users,
  finance: DollarSign,
  inventory: Package,
  reports: Activity,
};

/** A sign-up link to the studio dashboard. */
function SignUpLink({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <a href={DASHBOARD_URL} className={className}>
      {children}
    </a>
  );
}

export function DemoSection() {
  return (
    <section className="demo-section" id="demo">
      <div className="demo-section-inner">
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-label centered">Interaktywne Demo</div>
          <h2 className="section-title centered" style={{ marginBottom: 16 }}>
            Wypróbuj jak to <em>działa</em>
          </h2>
          <p className="section-subtitle centered">
            Klikaj po zakładkach w sidebarze, aby zobaczyć poszczególne widoki aplikacji z przykładowymi danymi.
          </p>
        </div>
        <div className="reveal">
          <AppDemo />
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section className="features-section" id="features">
      <div className="reveal">
        <div className="section-label">Funkcje</div>
        <h2 className="section-title">
          Wszystko czego
          <br />
          potrzebuje <em>Twoje studio</em>
        </h2>
      </div>
      <div className="features-grid">
        {FEATURES.map((feat, i) => {
          const Icon = FEATURE_ICONS[feat.id];
          const iconVariant = feat.variant === 'amber' || feat.variant === 'pale' ? feat.variant : '';
          return (
            <div
              key={feat.id}
              className={`feat-card ${feat.layout} ${feat.variant === 'dark' ? 'dark' : ''} reveal reveal-delay-${(i % 3) + 1}`}
            >
              <div className={`feat-icon ${iconVariant}`}>
                <Icon size={20} />
              </div>
              <h3 className="feat-title">{feat.title}</h3>
              <p className="feat-desc">{feat.desc}</p>
              <FeatureMiniUi id={feat.id} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="how-section" id="how">
      <div className="reveal">
        <div className="section-label light">Jak to działa</div>
        <h2 className="section-title light">
          Gotowy w <em>3 minuty.</em>
          <br />
          Serio.
        </h2>
      </div>
      <ol className="steps-grid reveal">
        {STEPS.map((step, i) => (
          <li key={step.num} className="step">
            <div className="step-number" aria-hidden>
              {step.num}
            </div>
            <div className="step-badge" aria-hidden>
              {i + 1}
            </div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-desc">{step.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PricingSection() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="reveal" style={{ textAlign: 'center' }}>
        <div className="section-label centered">Cennik</div>
        <h2 className="section-title centered" style={{ marginBottom: 16 }}>
          Prosty cennik,
          <br />
          bez niespodzianek
        </h2>
        <p className="section-subtitle centered" style={{ marginBottom: 64 }}>
          XXX dni za darmo. Bez karty kredytowej.
        </p>
      </div>
      <div className="pricing-grid">
        {PRICING.map((plan, i) => (
          <div key={plan.tier} className={`price-card ${plan.featured ? 'featured' : ''} reveal reveal-delay-${i + 1}`}>
            {plan.featured && <div className="popular-badge">Najpopularniejszy</div>}
            <h3 className="price-tier">{plan.tier}</h3>
            <div className="price-amount">{plan.amount}</div>
            <div className="price-period">{plan.period}</div>
            <ul className="price-features">
              {plan.features.map((f) => (
                <li key={f}>
                  <span className="price-check">
                    <Check size={10} color={plan.featured ? 'var(--color-amber)' : 'var(--color-green-dark)'} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <SignUpLink className={`price-btn ${plan.btnClass}`}>{plan.btnLabel}</SignUpLink>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="cta-section">
      <div className="section-label centered light reveal">Zaczynamy?</div>
      <h2 className="cta-title reveal">
        Twoje studio zasługuje
        <br />
        na <em>lepsze narzędzia.</em>
      </h2>
      <p className="cta-sub reveal">Rezerwacje, klienci, magazyn i zespół w jednym miejscu, od pierwszego dnia.</p>
      <div className="cta-actions reveal">
        <SignUpLink className="btn-primary">
          Zacznij za darmo — XXX dni
          <ArrowRight size={16} />
        </SignUpLink>
      </div>
      <p className="cta-fine reveal">Bez karty kredytowej. Anuluj kiedy chcesz.</p>
    </section>
  );
}
