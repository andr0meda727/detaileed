import React, { useState, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Users, Package, LayoutDashboard, CalendarClock,
  LogOut, X, Building2, ChevronDown, Settings,
  FileBarChart2, Shield,
  Plus, Calendar, CheckCircle2, AlertTriangle, CreditCard, Activity,
  UserCheck, ChevronRight, Search, LayoutList, CalendarDays,
  User, Phone, Edit2, Star, TrendingUp, Clock, Download,
  Mail, Trash2, UserPlus, Check
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const MOCK_BOOKINGS = [
  { id: '1', scheduledAt: '2026-04-15T09:00:00Z', completedAt: null, totalPrice: 45000, status: 'Utworzona', statusColor: '#3b82f6', notes: null, vehicle: { id: 'v1', licensePlate: 'WA 12345', brand: 'BMW', model: 'M4 Competition' }, client: { id: 'c1', name: 'Jan Kowalski', email: 'jan@email.com', phone: '+48 500 100 200' }, services: ['Korekta lakieru', 'Ceramika'] },
  { id: '2', scheduledAt: '2026-04-15T11:30:00Z', completedAt: null, totalPrice: 28000, status: 'Utworzona', statusColor: '#3b82f6', notes: null, vehicle: { id: 'v2', licensePlate: 'KR 98765', brand: 'Mercedes', model: 'AMG GT' }, client: { id: 'c2', name: 'Anna Nowak', email: 'anna@firma.pl', phone: '+48 600 300 400' }, services: ['Mycie detailingowe', 'Wosk'] },
  { id: '3', scheduledAt: '2026-04-15T14:00:00Z', completedAt: '2026-04-15T16:00:00Z', totalPrice: 85000, status: 'Zakończona', statusColor: '#22c55e', notes: 'Klient VIP', vehicle: { id: 'v3', licensePlate: 'GD 55555', brand: 'Porsche', model: '911 Turbo S' }, client: { id: 'c3', name: 'Marek Wiśniewski', email: null, phone: '+48 700 500 600' }, services: ['PPF folia ochronna', 'Korekta lakieru', 'Ceramika'] },
  { id: '4', scheduledAt: '2026-04-16T08:00:00Z', completedAt: null, totalPrice: 35000, status: 'Utworzona', statusColor: '#3b82f6', notes: null, vehicle: { id: 'v4', licensePlate: 'PO 77777', brand: 'Audi', model: 'RS6 Avant' }, client: { id: 'c4', name: 'Karolina Dąbrowska', email: 'karolina@auto.pl', phone: '+48 800 700 800' }, services: ['Korekta lakieru'] },
  { id: '5', scheduledAt: '2026-04-17T10:00:00Z', completedAt: null, totalPrice: 62000, status: 'Utworzona', statusColor: '#3b82f6', notes: null, vehicle: { id: 'v5', licensePlate: 'WR 33333', brand: 'Tesla', model: 'Model S Plaid' }, client: { id: 'c5', name: 'Piotr Lewandowski', email: 'piotr@tech.io', phone: '+48 900 800 700' }, services: ['Ceramika', 'Detailing wnętrza'] },
  { id: '6', scheduledAt: '2026-04-18T09:00:00Z', completedAt: null, totalPrice: 25000, status: 'Utworzona', statusColor: '#3b82f6', notes: null, vehicle: { id: 'v6', licensePlate: 'LU 44444', brand: 'Volkswagen', model: 'Golf R' }, client: { id: 'c6', name: 'Tomasz Zieliński', email: null, phone: '+48 501 502 503' }, services: ['Mycie detailingowe'] },
  { id: '7', scheduledAt: '2026-04-14T12:00:00Z', completedAt: '2026-04-14T15:00:00Z', totalPrice: 120000, status: 'Zakończona', statusColor: '#22c55e', notes: null, vehicle: { id: 'v7', licensePlate: 'WA 99999', brand: 'Lamborghini', model: 'Huracán EVO' }, client: { id: 'c7', name: 'Robert Szymański', email: 'robert@luxury.com', phone: '+48 600 600 600' }, services: ['PPF folia ochronna', 'Ceramika', 'Detailing wnętrza'] },
];

const MOCK_CLIENTS = [
  { id: 'c1', name: 'Jan Kowalski', email: 'jan@email.com', phone: '+48 500 100 200', nip: '1234567890', vehicles: [{ id: 'v1', licensePlate: 'WA 12345', brand: 'BMW', model: 'M4 Competition' }] },
  { id: 'c2', name: 'Anna Nowak', email: 'anna@firma.pl', phone: '+48 600 300 400', nip: null, vehicles: [{ id: 'v2', licensePlate: 'KR 98765', brand: 'Mercedes', model: 'AMG GT' }] },
  { id: 'c3', name: 'Marek Wiśniewski', email: null, phone: '+48 700 500 600', nip: null, vehicles: [{ id: 'v3', licensePlate: 'GD 55555', brand: 'Porsche', model: '911 Turbo S' }, { id: 'v8', licensePlate: 'GD 11111', brand: 'Porsche', model: 'Cayenne' }] },
  { id: 'c4', name: 'Karolina Dąbrowska', email: 'karolina@auto.pl', phone: '+48 800 700 800', nip: '9876543210', vehicles: [{ id: 'v4', licensePlate: 'PO 77777', brand: 'Audi', model: 'RS6 Avant' }] },
  { id: 'c5', name: 'Piotr Lewandowski', email: 'piotr@tech.io', phone: '+48 900 800 700', nip: null, vehicles: [{ id: 'v5', licensePlate: 'WR 33333', brand: 'Tesla', model: 'Model S Plaid' }] },
  { id: 'c6', name: 'Tomasz Zieliński', email: null, phone: '+48 501 502 503', nip: null, vehicles: [{ id: 'v6', licensePlate: 'LU 44444', brand: 'Volkswagen', model: 'Golf R' }] },
  { id: 'c7', name: 'Robert Szymański', email: 'robert@luxury.com', phone: '+48 600 600 600', nip: '5556667778', vehicles: [{ id: 'v7', licensePlate: 'WA 99999', brand: 'Lamborghini', model: 'Huracán EVO' }, { id: 'v9', licensePlate: 'WA 88888', brand: 'Ferrari', model: 'F8 Tributo' }] },
];

const MOCK_INVENTORY = [
  { id: 'i1', name: 'Gyeon Q² Mohs EVO', categoryName: 'Powłoki ceramiczne', unit: 'ml', stock: 450, minStock: 200 },
  { id: 'i2', name: 'Rupes DA Fine', categoryName: 'Pasty polerskie', unit: 'ml', stock: 120, minStock: 300 },
  { id: 'i3', name: 'Koch Chemie GSF', categoryName: 'Szampony', unit: 'L', stock: 8, minStock: 3 },
  { id: 'i4', name: 'Pad polerski 150mm', categoryName: 'Akcesoria', unit: 'szt', stock: 4, minStock: 10 },
  { id: 'i5', name: 'IPA 99%', categoryName: 'Chemia', unit: 'L', stock: 15, minStock: 5 },
  { id: 'i6', name: 'Mikrofibra bezszwowa', categoryName: 'Akcesoria', unit: 'szt', stock: 25, minStock: 10 },
  { id: 'i7', name: 'XPEL Ultimate Plus PPF', categoryName: 'Folie ochronne', unit: 'm²', stock: 12, minStock: 5 },
];

const MOCK_EMPLOYEES = [
  { userId: 'u1', email: 'jan.detailer@studio.pl', name: 'Jan Majewski', roleId: 1 },
  { userId: 'u2', email: 'kasia.wraps@studio.pl', name: 'Katarzyna Wójcik', roleId: 2 },
  { userId: 'u3', email: 'mateusz@studio.pl', name: 'Mateusz Kamiński', roleId: 3 },
];

const ROLES = [
  { id: 1, name: 'Właściciel', color: 'text-amber-600 bg-amber-50' },
  { id: 2, name: 'Manager', color: 'text-indigo-600 bg-indigo-50' },
  { id: 3, name: 'Pracownik', color: 'text-emerald-600 bg-emerald-50' },
];

const ACTIVITY_FEED = [
  { id: 1, text: 'Nowe zlecenie dodane', sub: 'BMW M4 Competition — Jan Kowalski', time: '14 min temu', icon: CheckCircle2, color: 'text-green-deep bg-cream-warm/30' },
  { id: 2, text: 'Rezerwacja potwierdzona', sub: 'Mercedes AMG GT — Anna Nowak', time: '32 min temu', icon: Calendar, color: 'text-blue-500 bg-blue-50' },
  { id: 3, text: 'Niski stan magazynowy', sub: 'Pad polerski 150mm — 4 szt', time: '1 godz. temu', icon: AlertTriangle, color: 'text-amber bg-amber/10' },
  { id: 4, text: 'Zlecenie zakończone', sub: 'Porsche 911 Turbo S — 850,00 zł', time: '2 godz. temu', icon: CreditCard, color: 'text-violet-500 bg-violet-50' },
  { id: 5, text: 'Nowy klient dodany', sub: 'Piotr Lewandowski — Tesla Model S', time: '3 godz. temu', icon: UserCheck, color: 'text-cyan-500 bg-cyan-50' },
];

type DemoView = 'Dashboard' | 'Tasks' | 'Clients' | 'Team' | 'Inventory' | 'Reports';

// ═══════════════════════════════════════════════════════════════
// SIDEBAR NAV BUTTON
// ═══════════════════════════════════════════════════════════════

const DemoNavBtn: React.FC<{
  id: string; icon: LucideIcon; label: string;
  activeView: DemoView; setActiveView: (v: DemoView) => void;
}> = ({ id, icon: Icon, label, activeView, setActiveView }) => {
  const active = activeView === id;
  return (
    <button
      onClick={() => setActiveView(id as DemoView)}
      className={`
        w-full flex items-center gap-4 rounded-xl transition-all duration-200 group relative
        px-5 py-3.5
        ${active ? 'bg-white/12 text-white' : 'text-white/55 hover:text-white hover:bg-white/7'}
      `}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-amber"
          style={{ boxShadow: '0 0 8px rgba(232,168,48,0.6)' }}
        />
      )}
      <Icon
        size={19}
        strokeWidth={active ? 2.5 : 2}
        className={active ? 'text-amber shrink-0' : 'text-white/35 shrink-0 group-hover:text-white/70 transition-colors'}
      />
      <span className="font-syne font-bold text-[14px] tracking-wide whitespace-nowrap">{label}</span>
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════

const DemoSidebar: React.FC<{ activeView: DemoView; setActiveView: (v: DemoView) => void }> = ({ activeView, setActiveView }) => {
  const menuItems: { id: DemoView; icon: LucideIcon; label: string }[] = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Panel Główny' },
    { id: 'Tasks', icon: CalendarClock, label: 'Rezerwacje' },
    { id: 'Clients', icon: Users, label: 'Klienci' },
    { id: 'Team', icon: Shield, label: 'Zespół' },
    { id: 'Inventory', icon: Package, label: 'Magazyn' },
    { id: 'Reports', icon: FileBarChart2, label: 'Raporty' },
  ];

  return (
    <div
      className="w-72 flex flex-col shrink-0 border-r border-white/5"
      style={{ background: 'linear-gradient(160deg, #1a2e1e 0%, #1c3220 45%, #172818 100%)' }}
    >
      <div className="flex flex-col flex-1 overflow-y-auto px-5 pt-7 pb-5">
        {/* Logo */}
        <div className="flex items-center gap-3 group mb-7 px-1">
          <img
            src="/detaileed-log.svg"
            alt="Detaileed"
            className="w-10 h-10 rounded-[0.875rem] shrink-0 object-cover"
          />
          <div>
            <h1 className="font-sans font-black text-[19px] tracking-tight text-white leading-none">
              <span className="text-amber">D</span>etaileed
            </h1>
            <span className="font-sans font-medium text-[8px] tracking-[0.22em] text-white/35 uppercase mt-1 block">Studio OS</span>
          </div>
        </div>

        {/* Studio switcher */}
        <div className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border mb-6 bg-white/5 border-white/5 text-white/50">
          <Building2 size={14} className="text-white/30 shrink-0" />
          <span className="flex-1 text-left text-[11.5px] font-syne font-bold tracking-wide truncate">Demo Studio Detailing</span>
          <ChevronDown size={12} className="opacity-30 shrink-0" />
        </div>

        {/* Main nav */}
        <nav className="space-y-1.5 flex-1">
          {menuItems.map(item => (
            <DemoNavBtn key={item.id} id={item.id} icon={item.icon} label={item.label} activeView={activeView} setActiveView={setActiveView} />
          ))}
        </nav>

        {/* Divider */}
        <div className="my-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }} />

        {/* Settings */}
        <div className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-white/55">
          <Settings size={19} strokeWidth={2} className="text-white/35 shrink-0" />
          <span className="flex-1 text-left font-syne font-bold text-[14px] tracking-wide">Ustawienia</span>
          <ChevronDown size={13} className="opacity-30 shrink-0" />
        </div>

        <div className="my-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }} />

        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-2 mb-2 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
            <span className="text-cream-warm font-bold text-[10px] uppercase">D</span>
          </div>
          <span className="text-white/35 text-[11px] font-medium truncate">demo@detaileed.com</span>
        </div>

        {/* Logout */}
        <div className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-white/40">
          <LogOut size={18} strokeWidth={2} className="text-white/30 shrink-0" />
          <span className="font-syne font-bold text-[14px] tracking-wide">Wyloguj</span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// HEADER (replicates GlobalHeader)
// ═══════════════════════════════════════════════════════════════

const DemoHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 lg:mb-12">
    <div className="space-y-2">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-green-deep tracking-tight leading-none">{title}</h1>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-deep/8 text-green-deep rounded-lg text-[9px] font-bold uppercase tracking-[0.15em] border border-green-deep/10">
          <div className="w-1.5 h-1.5 rounded-full bg-green-light animate-pulse" />
          Demo Mode
        </div>
        <p className="text-green-light/70 font-semibold text-[12px] truncate">{subtitle}</p>
      </div>
    </div>
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <button className="flex items-center justify-center gap-2.5 bg-amber text-green-deep px-6 lg:px-8 py-3.5 lg:py-4 rounded-lg font-bold text-[12px] lg:text-[13px] shadow-[0_8px_24px_-8px_rgba(232,168,48,0.5)] hover:-translate-y-1 hover:bg-amber-light transition-all duration-300 group">
        <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="whitespace-nowrap tracking-wide uppercase">Dodaj Rezerwację</span>
      </button>
      <button className="flex items-center justify-center gap-2 bg-white text-green-deep border border-green-deep/15 px-6 lg:px-8 py-3.5 lg:py-4 rounded-lg font-bold text-[12px] lg:text-[13px] hover:bg-green-deep/4 transition-all duration-300 group shadow-sm">
        <UserPlus size={16} strokeWidth={2.5} />
        <span className="whitespace-nowrap tracking-wide uppercase">Nowy Klient</span>
      </button>
    </div>
  </header>
);

// ═══════════════════════════════════════════════════════════════
// STAT CARD
// ═══════════════════════════════════════════════════════════════

const StatCard: React.FC<{
  icon: LucideIcon; label: string; value: string; sub: string;
  iconBg: string; iconColor: string;
}> = ({ icon: Icon, label, value, sub, iconBg, iconColor }) => (
  <div className="floating-card-static p-5 sm:p-6 flex items-center gap-5">
    <div className="w-12 h-12 rounded-[0.875rem] flex items-center justify-center shrink-0 shadow-lg" style={{ background: iconBg }}>
      <Icon size={20} color={iconColor} />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-bold text-green-deep/40 uppercase tracking-[0.15em]">{label}</p>
      <p className="text-2xl font-extrabold text-green-deep font-mono tracking-tighter leading-none mt-1">{value}</p>
      <p className="text-[10px] font-semibold text-green-light/60 mt-1">{sub}</p>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// DASHBOARD VIEW
// ═══════════════════════════════════════════════════════════════

const DemoDashboardView: React.FC<{ setActiveView: (v: DemoView) => void }> = ({ setActiveView }) => {
  const todayBookings = MOCK_BOOKINGS.filter(b => b.scheduledAt.startsWith('2026-04-15'));
  const upcomingBookings = MOCK_BOOKINGS.filter(b => !b.scheduledAt.startsWith('2026-04-15') && b.completedAt === null);
  const lowStockItems = MOCK_INVENTORY.filter(i => i.stock < i.minStock);

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 sm:space-y-8">
      <DemoHeader title="Panel" subtitle="Studio Demo Detailing" />

      {/* Greeting */}
      <div className="relative rounded-xl p-6 lg:p-8 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a2e1e 0%, #1e3523 50%, #152b1a 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(237,231,216,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold text-cream-warm uppercase tracking-[0.4em] mb-3">Wtorek, 15 Kwietnia 2026</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white leading-none">Dzień dobry 👋</h2>
            <p className="text-white/40 text-[13px] font-medium mt-3 max-w-md">
              Masz <span className="text-cream-warm font-bold">{todayBookings.length}</span> zleceń na dziś i <span className="text-cream-warm font-bold">{upcomingBookings.length}</span> nadchodzących.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-amber text-green-deep px-5 py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest shadow-[0_4px_6px_rgba(232,168,48,0.35)] hover:-translate-y-0.5 transition-all shrink-0">
            <Plus size={15} strokeWidth={3} /> Nowe Zlecenie
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Przychód Dziś" value="1 580 zł" sub="+12%" iconBg="#1a2e1e" iconColor="#f5f0e8" />
        <StatCard icon={Clock} label="Aktywne Zlecenia" value="5" sub="3 dziś" iconBg="rgba(232,168,48,0.12)" iconColor="#e8a830" />
        <StatCard icon={Users} label="Baza Klientów" value="7" sub="aktywni" iconBg="rgba(61,107,70,0.1)" iconColor="#3d6b46" />
        <StatCard icon={CheckCircle2} label="Ukończone" value="2" sub="łącznie" iconBg="rgba(34,197,94,0.1)" iconColor="#22c55e" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
          {/* Today's Schedule */}
          <div className="floating-card-static p-6 lg:p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-sans font-bold text-green-deep">Dzisiejszy Grafik</h4>
                <p className="text-[11px] font-semibold text-green-light/60 uppercase tracking-wide mt-1">{todayBookings.length} zleceń zaplanowanych</p>
              </div>
              <div className="w-10 h-10 bg-green-deep text-cream rounded-[0.875rem] flex items-center justify-center shadow-lg shrink-0"><Calendar size={17} /></div>
            </div>
            <div className="space-y-3">
              {todayBookings.map(booking => (
                <div key={booking.id}
                  className="p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 cursor-pointer group transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)]"
                  style={{ background: 'rgba(26,46,30,0.03)', border: '1px solid rgba(26,46,30,0.05)' }}
                >
                  <div className="flex items-center justify-between sm:flex-col sm:justify-center sm:min-w-[90px] sm:border-r sm:pr-6 shrink-0" style={{ borderColor: 'rgba(26,46,30,0.08)' }}>
                    <span className="text-xl font-bold text-green-deep font-mono">{formatTime(booking.scheduledAt)}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border mt-1.5" style={{ color: booking.statusColor, borderColor: booking.statusColor + '40', backgroundColor: booking.statusColor + '12' }}>{booking.status}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-lg font-sans font-bold text-green-deep truncate">{booking.vehicle.brand} {booking.vehicle.model}</h5>
                    <p className="text-[11px] font-bold text-green-deep/35 uppercase tracking-widest mt-0.5 truncate">{booking.services.join(', ')}</p>
                    <p className="text-[12px] font-semibold text-green-light mt-1"><UserCheck size={10} className="inline mr-1" />{booking.client.name}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                    {booking.status === 'Utworzona' && (
                      <>
                        <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-pale/40 text-green-light hover:bg-green-pale/70 transition-all"><Check size={16} strokeWidth={2.5} /></button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-all"><X size={16} strokeWidth={2.5} /></button>
                      </>
                    )}
                    <div className="bg-green-deep text-cream px-3 py-1.5 rounded-xl font-mono text-[13px] font-bold tracking-wider uppercase shadow-md">{booking.vehicle.licensePlate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming */}
          <div className="floating-card-static p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-lg lg:text-xl font-sans font-bold text-green-deep">Nadchodzące</h4>
                <p className="text-[11px] font-semibold text-green-light/60 uppercase tracking-wide mt-1">następne {upcomingBookings.length} rezerwacji</p>
              </div>
              <button onClick={() => setActiveView('Tasks')} className="text-[9px] font-semibold text-green-light uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">Wszystkie <ChevronRight size={13} /></button>
            </div>
            <div className="space-y-2">
              {upcomingBookings.slice(0, 4).map(booking => {
                const dt = new Date(booking.scheduledAt);
                const day = String(dt.getDate()).padStart(2, '0');
                const monthIdx = dt.getMonth();
                const months = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
                return (
                  <div key={booking.id} className="p-4 rounded-xl flex items-center gap-5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.07)]" style={{ background: 'rgba(26,46,30,0.03)', border: '1px solid rgba(26,46,30,0.05)' }}>
                    <div className="text-center shrink-0 min-w-[50px] border-r pr-4" style={{ borderColor: 'rgba(26,46,30,0.08)' }}>
                      <p className="text-xl font-bold text-green-deep font-mono leading-none">{day}</p>
                      <p className="text-[8px] font-bold text-green-light/60 uppercase tracking-wider">{months[monthIdx]}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold text-green-deep truncate">{booking.vehicle.brand} {booking.vehicle.model}</h5>
                      <p className="text-[9px] font-bold text-green-deep/30 uppercase tracking-widest truncate">{booking.services.join(', ')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-green-deep font-mono">{(booking.totalPrice / 100).toFixed(2).replace('.', ',')} <span className="text-[9px] text-green-deep/35">zł</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8">
          {/* Quick Actions */}
          <div className="floating-card-static p-6 sm:p-7">
            <h4 className="text-lg font-sans font-bold text-green-deep mb-5">Szybkie Akcje</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Rezerwacja', icon: Calendar, style: { background: 'linear-gradient(135deg, #1a2e1e 0%, #2d4f33 100%)', color: '#f5f0e8' } as React.CSSProperties, iconColor: '#e8a830' },
                { label: 'Nowy Klient', icon: User, style: { background: 'linear-gradient(135deg, #e8a830 0%, #d4941c 100%)', color: '#1a2e1e' } as React.CSSProperties, iconColor: '#1a2e1e' },
                { label: 'Nowy Pojazd', icon: Star, style: { background: 'linear-gradient(135deg, #3d6b46 0%, #2d5235 100%)', color: '#f5f0e8' } as React.CSSProperties, iconColor: '#c8e6be' },
                { label: 'Magazyn', icon: Package, style: { background: 'linear-gradient(135deg, #f0ebe0 0%, #e8e0d0 100%)', color: '#1a2e1e', border: '1px solid rgba(26,46,30,0.1)' } as React.CSSProperties, iconColor: '#3d6b46' },
              ].map((qa, i) => (
                <button key={i} className="p-4 rounded-2xl flex flex-col items-center gap-2.5 transition-all active:scale-95 hover:-translate-y-1 hover:shadow-lg duration-200" style={qa.style}>
                  <qa.icon size={22} strokeWidth={2} color={qa.iconColor} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{qa.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="floating-card-static p-6 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-lg font-sans font-bold text-green-deep">Alerty Magazynowe</h4>
              <div className="w-9 h-9 rounded-[0.875rem] flex items-center justify-center bg-amber/15 text-amber"><Package size={16} /></div>
            </div>
            <div className="space-y-2">
              {lowStockItems.map(item => (
                <div key={item.id} className="p-4 rounded-2xl flex items-center justify-between" style={{ background: 'rgba(232,168,48,0.07)', border: '1px solid rgba(232,168,48,0.15)' }}>
                  <div>
                    <h5 className="text-[13px] font-bold text-green-deep truncate">{item.name}</h5>
                    <p className="text-[10px] font-semibold text-amber uppercase tracking-widest">{item.categoryName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-amber font-mono">{item.stock}<span className="text-[11px] ml-0.5 opacity-60">{item.unit}</span></p>
                    <p className="text-[10px] font-semibold text-green-deep/35 uppercase">min. {item.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="floating-card-static p-6 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-lg font-sans font-bold text-green-deep">Aktywność</h4>
              <div className="w-9 h-9 bg-green-deep text-cream rounded-[0.875rem] flex items-center justify-center"><Activity size={16} /></div>
            </div>
            <div className="space-y-0.5">
              {ACTIVITY_FEED.map(item => (
                <div key={item.id} className="flex items-start gap-3.5 p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-green-deep/4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}><item.icon size={14} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-green-deep leading-tight">{item.text}</p>
                    <p className="text-[9px] font-semibold text-green-deep/35 mt-0.5 truncate">{item.sub}</p>
                  </div>
                  <span className="text-[8px] font-semibold text-green-deep/25 whitespace-nowrap shrink-0 mt-0.5">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TASKS (BOOKINGS) VIEW
// ═══════════════════════════════════════════════════════════════

const DemoTasksView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'in-progress' | 'calendar' | 'search'>('in-progress');
  const [filterStatus, setFilterStatus] = useState<'all' | 'UTWORZONA' | 'ZAKONCZONA'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (iso: string) => { const d = new Date(iso); return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`; };

  const filtered = useMemo(() => {
    let result = [...MOCK_BOOKINGS];
    if (filterStatus === 'UTWORZONA') result = result.filter(b => b.status === 'Utworzona');
    if (filterStatus === 'ZAKONCZONA') result = result.filter(b => b.status === 'Zakończona');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.client.name.toLowerCase().includes(q) ||
        b.vehicle.brand.toLowerCase().includes(q) ||
        b.vehicle.licensePlate.toLowerCase().includes(q) ||
        b.services.join(' ').toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [filterStatus, searchQuery]);

  const grouped = useMemo(() => {
    const g = filtered.reduce((acc, b) => {
      const d = b.scheduledAt.split('T')[0];
      if (!acc[d]) acc[d] = [];
      acc[d].push(b);
      return acc;
    }, {} as Record<string, typeof MOCK_BOOKINGS>);
    return Object.entries(g).map(([date, bks]) => ({ date, bookings: bks })).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  const renderCard = (b: typeof MOCK_BOOKINGS[0], idx: number) => (
    <div key={b.id} className="floating-card flex flex-col sm:flex-row items-stretch cursor-pointer overflow-hidden" style={{ animationDelay: `${idx * 50}ms` }}>
      <div className="p-5 sm:p-6 flex flex-col items-center justify-center min-w-[110px] shrink-0" style={{ borderRight: '1px solid rgba(26,46,30,0.05)', background: 'rgba(26,46,30,0.02)' }}>
        <span className="text-2xl font-bold text-green-deep font-mono leading-none">{formatDate(b.scheduledAt)}</span>
        <span className="text-[10px] font-semibold text-green-deep/35 font-mono tracking-widest mt-2">{formatTime(b.scheduledAt)}</span>
      </div>
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-green-deep text-cream px-3 py-1 rounded-lg font-mono text-[10px] font-bold tracking-widest">{b.vehicle.licensePlate}</span>
          <h4 className="font-sans font-bold text-green-deep text-base tracking-tight truncate">{b.vehicle.brand} {b.vehicle.model}</h4>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <span className="text-[11px] font-semibold text-green-deep/40 uppercase tracking-wide">{b.services.join(', ')}</span>
          <span className="text-[11px] font-semibold text-green-light/70"><User size={10} className="inline mr-1" />{b.client.name}</span>
        </div>
      </div>
      <div className="px-5 sm:px-6 py-4 flex items-center justify-end sm:shrink-0" style={{ borderTop: '1px solid rgba(26,46,30,0.04)', background: 'rgba(26,46,30,0.01)' }}>
        <span className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border" style={{ color: b.statusColor, borderColor: b.statusColor + '35', backgroundColor: b.statusColor + '10' }}>{b.status}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <DemoHeader title="Rezerwacje" subtitle="Harmonogram • Demo Studio" />

      <div className="flex p-1.5 w-full md:w-[440px] rounded-full bg-white border border-green-deep/7 shadow-sm">
        {([
          { id: 'in-progress', icon: LayoutList, label: 'Zlecenia' },
          { id: 'calendar', icon: CalendarDays, label: 'Kalendarz' },
          { id: 'search', icon: Search, label: 'Wyszukiwarka' },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === t.id ? 'bg-green-deep text-cream shadow-lg' : 'text-green-deep/40 hover:text-green-deep'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'in-progress' && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-2">
            {([{ id: 'all', label: 'Wszystkie' }, { id: 'UTWORZONA', label: 'W toku' }, { id: 'ZAKONCZONA', label: 'Ukończone' }] as const).map(f => (
              <button key={f.id} onClick={() => setFilterStatus(f.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filterStatus === f.id ? 'bg-green-deep text-cream shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:border-green-deep/20'}`}>
                {f.label}
              </button>
            ))}
          </div>
          {grouped.map(group => (
            <div key={group.date} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2 border-b border-slate-100 pb-2">
                {new Date(group.date).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <div className="space-y-4">{group.bookings.map((b, idx) => renderCard(b, idx))}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="relative w-full md:w-[420px]">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Tablica, klient, model, usługa..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-cream-warm/20 transition-all" />
          </div>
          {searchQuery ? (
            <div className="space-y-4">
              <span className="text-[10px] font-semibold text-green-light uppercase tracking-widest">Znaleziono: {filtered.length}</span>
              {filtered.map((b, idx) => renderCard(b, idx))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-slate-100">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"><Search size={28} className="text-slate-300" /></div>
              <p className="text-slate-400 text-sm font-semibold">Wpisz frazę aby wyszukać rezerwację</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-slate-100">
          <div className="w-16 h-16 bg-cream-warm/20 rounded-full flex items-center justify-center mx-auto mb-4"><CalendarDays size={28} className="text-green-deep/30" /></div>
          <p className="text-slate-400 text-sm font-semibold">Podgląd kalendarza dostępny w pełnej wersji</p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CLIENTS VIEW
// ═══════════════════════════════════════════════════════════════

const DemoClientsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return MOCK_CLIENTS.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      c.vehicles.some(v => v.licensePlate.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="space-y-8 pb-20">
      <DemoHeader title="Klienci" subtitle="CRM • Zarządzanie Relacjami" />

      <div className="relative group">
        <Search size={20} strokeWidth={2.5} className="absolute left-6 top-1/2 -translate-y-1/2 text-green-deep/30 group-focus-within:text-green-light transition-colors" />
        <input type="text" placeholder="Szukaj klienta, tablicy, modelu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-5 rounded-[2rem] font-semibold text-base text-green-deep outline-none transition-all bg-white border border-green-deep/7 shadow-sm focus:border-green-light/30" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-cream/30">
                <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] w-[25%]">Klient</th>
                <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] w-[20%]">Kontakt</th>
                <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] w-[40%]">Pojazdy we flocie</th>
                <th className="px-6 py-5 text-[10px] font-bold text-green-deep/60 uppercase tracking-[0.2em] text-right w-[15%]">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-sm">
              {filtered.map(client => (
                <tr key={client.id} className="group hover:bg-green-deep/[0.02] cursor-pointer transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-cream shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #1a2e1e 0%, #2a4a30 100%)' }}>
                        {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-green-deep text-base truncate max-w-[200px]">{client.name}</h3>
                        {client.nip && <p className="text-[10px] font-semibold text-green-deep/40 mt-1 uppercase tracking-wider">NIP: {client.nip}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <p className="font-bold text-green-deep/80 text-[13px]">{client.phone || <span className="text-slate-400 font-normal">Brak</span>}</p>
                      {client.email && <p className="font-semibold text-green-deep/50 text-[11px] max-w-[180px] truncate">{client.email}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {client.vehicles.slice(0, 2).map(v => (
                        <div key={v.id} className="flex items-center bg-slate-50 border border-slate-100 rounded-xl pr-1.5 py-1 pl-3 gap-3 shadow-sm">
                          <span className="font-bold text-green-deep text-[11px] max-w-[100px] truncate">{v.brand} {v.model}</span>
                          <span className="bg-green-deep text-cream px-2 py-1 rounded-md font-mono text-[10px] font-bold tracking-widest">{v.licensePlate}</span>
                        </div>
                      ))}
                      {client.vehicles.length > 2 && (
                        <div className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-green-deep/60 text-[10px] tracking-widest uppercase">+ {client.vehicles.length - 2}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {client.phone && (
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-deep/5 text-green-deep hover:bg-green-deep hover:text-cream transition-all shadow-sm cursor-pointer">
                          <Phone size={14} />
                        </div>
                      )}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-green-deep border border-slate-100 transition-all shadow-sm cursor-pointer">
                        <Edit2 size={14} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TEAM VIEW
// ═══════════════════════════════════════════════════════════════

const DemoTeamView: React.FC = () => (
  <div className="space-y-8 pb-20">
    <DemoHeader title="Zespół" subtitle="Zarządzaj Pracownikami w Studiu" />

    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
      <div className="flex-1 relative group max-w-sm">
        <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Szukaj osoby..." className="w-full pl-14 pr-8 py-4 bg-white border border-slate-100 rounded-xl font-bold text-sm outline-none shadow-sm focus:border-cream-warm/40 transition-all" />
      </div>
      <button className="flex items-center justify-center gap-2 px-8 py-4 bg-green-deep text-cream rounded-xl font-semibold text-[11px] uppercase tracking-widest hover:shadow-xl transition-all">
        <UserPlus size={16} /> Zaproś do Zespołu
      </button>
    </div>

    <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-green-deep tracking-tight flex items-center gap-3">
          <Users className="text-amber" /> Kadra Pracownicza
          <span className="text-xs font-semibold text-slate-400 py-1 px-3 bg-slate-50 rounded-full">{MOCK_EMPLOYEES.length} OSÓB</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_EMPLOYEES.map(emp => {
          const role = ROLES.find(r => r.id === emp.roleId)!;
          return (
            <div key={emp.userId} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-cream" style={{ backgroundColor: '#1a2e1e' }}>
                    {emp.name[0]}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl ${role.color}`}>{role.name}</span>
                </div>
                <h4 className="text-lg font-bold text-green-deep mb-1 truncate">{emp.name}</h4>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                  <Mail size={12} className="text-green-deep/40" />
                  <span className="truncate">{emp.email}</span>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 mt-6 flex justify-end">
                <div className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer">
                  <Trash2 size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// INVENTORY VIEW
// ═══════════════════════════════════════════════════════════════

const DemoInventoryView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return MOCK_INVENTORY.filter(i => i.name.toLowerCase().includes(q) || i.categoryName.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-10">
      <DemoHeader title="Magazyn" subtitle="Baza Produktów Studio OS" />

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Szukaj produktu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-xl outline-none shadow-sm focus:ring-8 focus:ring-cream-warm/20 transition-all font-bold text-sm sm:text-base" />
        </div>
        <button className="bg-green-deep text-cream px-10 py-5 rounded-xl font-semibold text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all">
          <Plus size={18} /> Dodaj Produkt
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Produkt</th>
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Kategoria</th>
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-right">Stan</th>
                <th className="px-10 py-8 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-center">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-green-light transition-colors"><Package size={20} /></div>
                      <span className="font-bold text-green-deep text-base lg:text-lg tracking-tighter">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="px-4 py-1.5 bg-white border border-slate-100 text-slate-500 rounded-lg text-[10px] font-semibold uppercase tracking-widest">{item.categoryName}</span>
                  </td>
                  <td className={`px-10 py-8 text-right font-mono text-xl lg:text-2xl font-extrabold ${item.stock < item.minStock ? 'text-red-500' : 'text-green-deep'}`}>
                    {item.stock}<span className="text-[10px] ml-1 opacity-40 uppercase">{item.unit}</span>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-green-deep hover:text-cream transition-all"><Edit2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// REPORTS VIEW
// ═══════════════════════════════════════════════════════════════

const DemoReportsView: React.FC = () => (
  <div className="space-y-8 pb-20">
    <DemoHeader title="Raporty" subtitle="Eksport Danych i Analizy" />

    <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 border border-slate-100 shadow-sm max-w-3xl">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-14 h-14 bg-green-deep rounded-2xl flex items-center justify-center text-cream shadow-lg shrink-0">
          <FileBarChart2 size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-green-deep tracking-tight">Raport Rezerwacji</h3>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Wygeneruj zestawienie finansowe wizyt</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
              <Calendar size={12} /> Data Od
            </label>
            <input type="date" defaultValue="2026-04-01" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm text-green-deep" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
              <Calendar size={12} /> Data Do
            </label>
            <input type="date" defaultValue="2026-04-15" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm text-green-deep" />
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100">
          <button className="w-full sm:w-auto px-8 py-5 bg-green-deep text-cream rounded-xl font-semibold text-[11px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3">
            <Download size={18} /> Pobierz Raport
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN DEMO COMPONENT
// ═══════════════════════════════════════════════════════════════

const AppDemo: React.FC = () => {
  const [activeView, setActiveView] = useState<DemoView>('Dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'Dashboard': return <DemoDashboardView setActiveView={setActiveView} />;
      case 'Tasks': return <DemoTasksView />;
      case 'Clients': return <DemoClientsView />;
      case 'Team': return <DemoTeamView />;
      case 'Inventory': return <DemoInventoryView />;
      case 'Reports': return <DemoReportsView />;
      default: return <DemoDashboardView setActiveView={setActiveView} />;
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden border border-slate-200/60 shadow-2xl"
      style={{ height: '720px', background: 'var(--color-cream)' }}
    >
      <div className="flex h-full">
        <DemoSidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto mesh-bg">
          <div className="max-w-7xl mx-auto pb-24 pt-2">{renderView()}</div>
        </main>
      </div>
    </div>
  );
};

export default AppDemo;
