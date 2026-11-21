import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Play, Users, DollarSign, Package, Activity, CalendarDays, Check } from 'lucide-react';
import { AppDemo } from '../components/AppDemo';

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════

const LOGOS = [
  'Shine Masters',
  'AutoGloss Studio',
  'PerfectDetail',
  'GlossWorks',
  'CarCare Pro',
  'DetailShop',
  'CeramiQ',
  'LuxDetail',
];

const FEATURES = [
  {
    id: 'calendar',
    icon: CalendarDays,
    title: 'Harmonogram & Rezerwacje',
    desc: 'Widok kalendarza i listy zleceń w jednym. Dodaj nową rezerwację w kilka sekund — klient, pojazd, usługa, termin.',
    layout: 'wide' as const,
    variant: 'default' as const,
  },
  {
    id: 'crm',
    icon: Users,
    title: 'CRM — Baza Klientów',
    desc: 'Pełna historia każdego klienta, pojazdy, faktury i notatki w jednym miejscu.',
    layout: 'narrow' as const,
    variant: 'dark' as const,
  },
  {
    id: 'finance',
    icon: DollarSign,
    title: 'Finanse studia',
    desc: 'Przychody, zestawienia tygodniowe i miesięczne. Zawsze wiesz ile zarabia Twoje studio.',
    layout: 'third' as const,
    variant: 'pale' as const,
  },
  {
    id: 'inventory',
    icon: Package,
    title: 'Magazyn',
    desc: 'Śledź stan produktów chemicznych i akcesoriów. Alerty przy niskim stanie.',
    layout: 'third' as const,
    variant: 'amber' as const,
  },
  {
    id: 'reports',
    icon: Activity,
    title: 'Raporty',
    desc: 'Statystyki studia, najpopularniejsze usługi i historia archiwalna.',
    layout: 'third' as const,
    variant: 'pale' as const,
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Utwórz studio',
    desc: 'Zarejestruj się i wprowadź dane swojego studia.',
  },
  {
    num: '02',
    title: 'Dodaj klientów i rezerwacje',
    desc: 'Stwórz profil klienta, a następnie dodaj rezerwację. Pierwsza rezerwacja gotowa w mniej niż 1 minutę.',
  },
  {
    num: '03',
    title: 'Zarządzaj wszystkim z jednego miejsca',
    desc: 'Rezerwacje, baza klientów, magazyn i raporty — wszystko zsynchronizowane, w czasie rzeczywistym, na każdym urządzeniu.',
  },
];

const TESTIMONIALS = [
  {
    initials: 'KM',
    name: 'Krzysztof Malinowski',
    role: 'Właściciel, Shine Masters Warszawa',
    text: '"Detaileed zmienił sposób w jaki prowadzę studio. Koniec z excelem i papierowym kalendarzem. Wszystko mam pod ręką."',
  },
  {
    initials: 'AP',
    name: 'Aleksandra Piotrowska',
    role: 'Właścicielka, GlossWorks Kraków',
    text: '"Moduł CRM to game-changer. Pamiętam historię każdego klienta i mogę zaproponować odpowiednią usługę przy kolejnej wizycie."',
  },
  {
    initials: 'TW',
    name: 'Tomasz Wróblewski',
    role: 'Właściciel, PerfectDetail Wrocław',
    text: '"Raporty finansowe pozwoliły mi zauważyć, które usługi najbardziej zarabiają. Zwiększyłem przychód o 30% w 3 miesiące."',
  },
];

const PRICING = [
  {
    tier: 'Starter',
    amount: '0 zł',
    period: '/ miesiąc',
    features: ['Do 8 rezerwacji / miesiąc', 'CRM — do 25 klientów', 'Podstawowe funkcjonalności'],
    btnClass: 'outline',
    btnLabel: 'Zacznij za darmo',
    featured: false,
  },
  {
    tier: 'Pro',
    amount: 'YYY zł',
    period: '/ miesiąc',
    features: [
      'Do 100 rezerwacji / miesiąc',
      'CRM — do 200 klientów',
      'Wszystkie funkcjonalności',
      'Raporty',
      'Archiwum zleceń',
      'Wsparcie',
    ],
    btnClass: 'amber',
    btnLabel: 'Zacznij z Pro',
    featured: true,
  },
  {
    tier: 'MAX',
    amount: 'XXX zł',
    period: '/ miesiąc',
    features: ['Nielimitowane rezerwacje', 'Priorytetowe wsparcie', 'Zaawansowane statystyki'],
    btnClass: 'dark',
    btnLabel: 'Zacznij z MAX',
    featured: false,
  },
];

// ═══════════════════════════════════════════════════════════════
// FEATURE CARD MINI UIs
// ═══════════════════════════════════════════════════════════════

const CalendarMiniUI: React.FC = () => {
  const days = [
    ['', '1', '2', '3', '4', '5', '6'],
    ['7', '8', '9', '10', '11', '12', '13'],
    ['14', '15', '16', '17', '18', '19', '20'],
  ];
  const eventDays = ['1', '4', '7', '9', '15', '17'];
  const amberDays = ['2', '11'];
  const todayDay = '18';

  return (
    <div className="feat-ui">
      <div className="mini-calendar-row">
        {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((d) => (
          <div key={d} className="mini-cal-label">
            {d}
          </div>
        ))}
      </div>
      {days.map((week, wi) => (
        <div key={wi} className="mini-calendar-row">
          {week.map((day, di) => {
            let cls = 'mini-cal-day';
            if (day === todayDay) cls += ' today';
            else if (amberDays.includes(day)) cls += ' event-amber';
            else if (eventDays.includes(day)) cls += ' event';
            return (
              <div key={di} className={cls}>
                {day}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const CRMMiniUI: React.FC = () => (
  <div className="feat-ui-dark">
    {[
      { initials: 'JK', name: 'Jan Kowalski', tag: 'VIP', count: '12 wizyt' },
      { initials: 'AN', name: 'Anna Nowak', tag: 'Nowy', count: '1 wizyta' },
      { initials: 'MW', name: 'Marek Wiśniew.', tag: 'VIP', count: '28 wizyt' },
      { initials: 'PZ', name: 'Piotr Zając', tag: 'Stały', count: '6 wizyt' },
    ].map((c) => (
      <div key={c.initials} className="crm-row">
        <div className="crm-avatar">{c.initials}</div>
        <div className="crm-name">{c.name}</div>
        <div className="crm-tag">{c.tag}</div>
        <div className="crm-count">{c.count}</div>
      </div>
    ))}
  </div>
);

const FinanceMiniUI: React.FC = () => {
  const bars = [
    { height: '40%', bg: 'rgba(26,46,30,0.08)' },
    { height: '55%', bg: 'rgba(26,46,30,0.12)' },
    { height: '70%', bg: 'rgba(26,46,30,0.15)' },
    { height: '60%', bg: 'rgba(26,46,30,0.2)' },
    { height: '85%', bg: 'rgba(26,46,30,0.25)' },
    { height: '100%', bg: 'var(--color-green-light)' },
    { height: '75%', bg: 'rgba(232,168,48,0.4)' },
  ];
  return (
    <>
      <div className="feat-chart">
        {bars.map((bar, i) => (
          <div key={i} className="feat-chart-bar" style={{ height: bar.height, background: bar.bg }} />
        ))}
      </div>
      <div className="feat-chart-labels">
        <span>Sty</span>
        <span>Lip</span>
      </div>
    </>
  );
};

const InventoryMiniUI: React.FC = () => (
  <div className="feat-ui">
    {[
      { name: 'Piana aktywna', stock: '26 szt', pct: 80, low: false },
      { name: 'Szampon FX Protect', stock: '4 szt', pct: 15, low: true },
      { name: 'Szampon Szpontex', stock: '130 szt', pct: 95, low: false },
    ].map((item) => (
      <div key={item.name} className="inv-row">
        <div>
          <div className="inv-name">{item.name}</div>
          <div className="inv-bar">
            <div className={`inv-fill ${item.low ? 'low' : ''}`} style={{ width: `${item.pct}%` }} />
          </div>
        </div>
        <div className={`inv-stock ${item.low ? 'low' : ''}`}>{item.stock}</div>
      </div>
    ))}
  </div>
);

const ReportsMiniUI: React.FC = () => (
  <div style={{ marginTop: 20 }}>
    {[
      { label: 'Korekta lakieru', pct: 38, color: 'var(--color-green-light)' },
      { label: 'Powłoka ceramiczna', pct: 29, color: 'var(--color-amber)' },
      { label: 'Mycie szczegółowe', pct: 21, color: 'rgba(26,46,30,0.25)' },
    ].map((s, i) => (
      <React.Fragment key={s.label}>
        <div className="feat-stat-row">
          <span className="feat-stat-label">{s.label}</span>
          <span className="feat-stat-value">{s.pct}%</span>
        </div>
        <div className={`feat-stat-bar ${i === 2 ? '' : ''}`}>
          <div className="feat-stat-fill" style={{ width: `${s.pct}%`, background: s.color }} />
        </div>
      </React.Fragment>
    ))}
  </div>
);

const FEATURE_UI_MAP: Record<string, React.FC> = {
  calendar: CalendarMiniUI,
  crm: CRMMiniUI,
  finance: FinanceMiniUI,
  inventory: InventoryMiniUI,
  reports: ReportsMiniUI,
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export const LandingPage: React.FC = () => {
  const [navScrolled, setNavScrolled] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // ── Navbar scroll handler
  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Custom cursor tracking
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const handleMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };
    document.addEventListener('mousemove', handleMove);
    return () => document.removeEventListener('mousemove', handleMove);
  }, []);

  // ── Cursor hover effect on interactive elements
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const addHover = () => ring.classList.add('hovering');
    const removeHover = () => ring.classList.remove('hovering');

    const selector = 'a, button, .feat-card, .testi-card, .step, .price-card';
    const els = document.querySelectorAll(selector);
    els.forEach((el) => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });
    return () => {
      els.forEach((el) => {
        el.removeEventListener('mouseenter', addHover);
        el.removeEventListener('mouseleave', removeHover);
      });
    };
  }, []);

  // ── Scroll-reveal observer
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    reveals.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* ── Custom Cursor ────────────────────────────────────── */}
      <div className="custom-cursor" ref={cursorRef}>
        <div className="cursor-ring" ref={ringRef} />
        <div className="cursor-dot" />
      </div>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className={`landing-nav ${navScrolled ? 'scrolled' : ''}`} id="navbar">
        <a href="#" className="nav-logo">
          <img src="/detaileed-log.svg" alt="Detaileed" className="nav-logo-img" />
          <span className="nav-logo-text">
            <span className="nav-logo-accent">D</span>etaileed
          </span>
        </a>
        <div className="nav-links">
          <a href="#demo">Demo</a>
          <a href="#features">Funkcje</a>
          <a href="#how">Jak to działa</a>
          <a href="#pricing">Cennik</a>
          <a href="https://app.detaileed.com" target="_blank" rel="noopener noreferrer" className="nav-cta">
            Zacznij za darmo
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-orb" />

        <div className="hero-badge">
          <div className="hero-badge-dot" />
          Studio OS dla detailerów
        </div>

        <h1 className="hero-headline">
          Zarządzaj studiem
          <br />
          <em>bez chaosu.</em>
        </h1>

        <p className="hero-sub">
          Detaileed to wszystko czego potrzebujesz — rezerwacje, klienci, magazyn i finanse w jednym miejscu.
          Zaprojektowane specjalnie dla studiów detailingu.
        </p>

        <div className="hero-actions">
          <a href="https://app.detaileed.com" target="_blank" rel="noopener noreferrer" className="btn-primary">
            Zacznij za darmo
            <ArrowRight size={16} />
          </a>
          <a href="#demo" className="btn-ghost">
            <Play size={16} />
            Zobacz demo
          </a>
        </div>
      </section>

      {/* ── Logos Bar ────────────────────────────────────────── */}
      <div className="logos-bar">
        <div className="logos-track">
          <span className="logos-label">Zaufali nam</span>
          {LOGOS.map((l) => (
            <span key={l} className="logo-item">
              {l}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          <span className="logos-label">Zaufali nam</span>
          {LOGOS.map((l) => (
            <span key={`dup-${l}`} className="logo-item">
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* ── Interactive Demo ─────────────────────────────────── */}
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

      {/* ── Features ─────────────────────────────────────────── */}
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
            const iconVariant =
              feat.variant === 'dark' ? '' : feat.variant === 'amber' ? 'amber' : feat.variant === 'pale' ? 'pale' : '';
            const MiniUI = FEATURE_UI_MAP[feat.id];
            const delayClass = `reveal-delay-${(i % 3) + 1}`;

            return (
              <div
                key={feat.id}
                className={`feat-card ${feat.layout} ${feat.variant === 'dark' ? 'dark' : ''} reveal ${delayClass}`}
              >
                <div className={`feat-icon ${iconVariant}`}>
                  <feat.icon size={20} />
                </div>
                <div className="feat-title">{feat.title}</div>
                <div className="feat-desc">{feat.desc}</div>
                {MiniUI && <MiniUI />}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="how-section" id="how">
        <div className="reveal">
          <div className="section-label light">Jak to działa</div>
          <h2 className="section-title light">
            Gotowy w <em>3 minuty.</em>
            <br />
            Serio.
          </h2>
        </div>
        <div className="steps-grid reveal">
          {STEPS.map((step, i) => (
            <div key={step.num} className="step">
              <div className="step-number">{step.num}</div>
              <div className="step-badge">{i + 1}</div>
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section className="pricing-section" id="pricing">
        <div className="reveal" style={{ textAlign: 'center' }}>
          <div className="section-label centered">Cennik</div>
          <h2 className="section-title centered" style={{ marginBottom: 16 }}>
            Prosty cennik,
            <br />
            bez niespodzianek
          </h2>
          <p className="section-subtitle centered" style={{ marginBottom: 64 }}>
            14 dni za darmo. Bez karty kredytowej.
          </p>
        </div>
        <div className="pricing-grid">
          {PRICING.map((plan, i) => (
            <div
              key={plan.tier}
              className={`price-card ${plan.featured ? 'featured' : ''} reveal reveal-delay-${i + 1}`}
            >
              {plan.featured && <div className="popular-badge">Najpopularniejszy</div>}
              <div className="price-tier">{plan.tier}</div>
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
              <a
                href="https://app.detaileed.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`price-btn ${plan.btnClass}`}
              >
                {plan.btnLabel}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="testimonials-section">
        <div className="reveal" style={{ textAlign: 'center' }}>
          <div className="section-label centered">Opinie</div>
          <h2 className="section-title centered" style={{ marginBottom: 64, maxWidth: 500 }}>
            Co mówią
            <br />
            <em>właściciele studiów</em>
          </h2>
        </div>
        <div className="testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.initials} className={`testi-card reveal reveal-delay-${i + 1}`}>
              <div className="testi-stars">
                {Array.from({ length: 5 }).map((_, si) => (
                  <span key={si}>★</span>
                ))}
              </div>
              <p className="testi-text">{t.text}</p>
              <div className="testi-author">
                <div className="testi-avatar">{t.initials}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="section-label centered light reveal">Zaczynamy?</div>
        <h2 className="cta-title reveal">
          Twoje studio zasługuje
          <br />
          na <em>lepsze narzędzia.</em>
        </h2>
        <p className="cta-sub reveal">Dołącz do setek detailerów którzy już zarządzają swoim studiem z Detaileed.</p>
        <div className="cta-actions reveal">
          <a href="https://app.detaileed.com" target="_blank" rel="noopener noreferrer" className="btn-primary">
            Zacznij za darmo — 14 dni
            <ArrowRight size={16} />
          </a>
        </div>
        <p className="cta-fine reveal">Bez karty kredytowej. Anuluj kiedy chcesz.</p>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="nav-logo" style={{ color: 'var(--color-cream)' }}>
              <img src="/detaileed-log.svg" alt="Detaileed" className="nav-logo-img" />
              <span className="nav-logo-text">
                <span className="nav-logo-accent">D</span>etaileed
              </span>
            </a>
            <p>Studio OS zaprojektowany specjalnie dla branży detailingu. Prosty, szybki, bezpieczny.</p>
          </div>
          <div className="footer-col">
            <h5>Produkt</h5>
            <a href="#features">Funkcje</a>
            <a href="#pricing">Cennik</a>
            <a href="#">Aktualizacje</a>
          </div>
          <div className="footer-col">
            <h5>Sociale</h5>
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
            <a href="#">Youtube</a>
            <a href="#">TikTok</a>
          </div>
          <div className="footer-col">
            <h5>Pomoc</h5>
            <a href="#">Kontakt</a>
            <a href="#">Polityka prywatności</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Detaileed. Wszelkie prawa zastrzeżone.</p>
          <p>Zbudowane z ❤️ dla detailerów</p>
        </div>
      </footer>
    </>
  );
};
