import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Plus,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { DEMO_TODAY, MOCK_BOOKINGS, MOCK_INVENTORY } from '../../model/demoData';
import { dateOf, dayOf, shortMonthOf, timeOf } from '../../model/demoFormat';
import { DemoHeader, StatCard } from './DemoHeader';
import { DashboardSideColumn } from './DashboardSideColumn';

const ROW = { background: 'rgba(26,46,30,0.03)', border: '1px solid rgba(26,46,30,0.05)' };

const todayBookings = MOCK_BOOKINGS.filter((b) => dateOf(b.scheduledAt) === DEMO_TODAY);
const upcomingBookings = MOCK_BOOKINGS.filter((b) => dateOf(b.scheduledAt) !== DEMO_TODAY && b.completedAt === null);
const lowStockItems = MOCK_INVENTORY.filter((i) => i.stock < i.minStock);

function Greeting() {
  return (
    <div
      className="relative rounded-xl p-6 lg:p-8 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a2e1e 0%, #1e3523 50%, #152b1a 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(237,231,216,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <p className="text-[11px] font-bold text-cream-warm uppercase tracking-[0.4em] mb-3">XXX</p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white leading-none">Dzień dobry 👋</p>
          <p className="text-white/40 text-[13px] font-medium mt-3 max-w-md">
            Masz <span className="text-cream-warm font-bold">{todayBookings.length}</span> zleceń na dziś i{' '}
            <span className="text-cream-warm font-bold">{upcomingBookings.length}</span> nadchodzących.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 bg-amber text-green-deep px-5 py-3 rounded-lg font-bold text-[11px] uppercase tracking-widest shadow-[0_4px_6px_rgba(232,168,48,0.35)] hover:-translate-y-0.5 transition-all shrink-0"
        >
          <Plus size={15} strokeWidth={3} /> Nowe Zlecenie
        </button>
      </div>
    </div>
  );
}

function TodaySchedule() {
  return (
    <div className="floating-card-static p-6 lg:p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-xl font-sans font-bold text-green-deep">Dzisiejszy Grafik</h4>
          <p className="text-[11px] font-semibold text-green-light/60 uppercase tracking-wide mt-1">
            {todayBookings.length} zleceń zaplanowanych
          </p>
        </div>
        <div className="w-10 h-10 bg-green-deep text-cream rounded-[0.875rem] flex items-center justify-center shadow-lg shrink-0">
          <Calendar size={17} />
        </div>
      </div>
      <div className="space-y-3">
        {todayBookings.map((booking) => (
          <div
            key={booking.id}
            className="p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 cursor-pointer group transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)]"
            style={ROW}
          >
            <div
              className="flex items-center justify-between sm:flex-col sm:justify-center sm:min-w-[90px] sm:border-r sm:pr-6 shrink-0"
              style={{ borderColor: 'rgba(26,46,30,0.08)' }}
            >
              <span className="text-xl font-bold text-green-deep font-mono">{timeOf(booking.scheduledAt)}</span>
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border mt-1.5"
                style={{
                  color: booking.statusColor,
                  borderColor: booking.statusColor + '40',
                  backgroundColor: booking.statusColor + '12',
                }}
              >
                {booking.status}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-lg font-sans font-bold text-green-deep truncate">
                {booking.vehicle.brand} {booking.vehicle.model}
              </h5>
              <p className="text-[11px] font-bold text-green-deep/35 uppercase tracking-widest mt-0.5 truncate">
                {booking.services.join(', ')}
              </p>
              <p className="text-[12px] font-semibold text-green-light mt-1">
                <UserCheck size={10} className="inline mr-1" />
                {booking.client.name}
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              {booking.status === 'Utworzona' && (
                <>
                  <button
                    type="button"
                    aria-label="Potwierdź"
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-pale/40 text-green-light hover:bg-green-pale/70 transition-all"
                  >
                    <Check size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    aria-label="Odrzuć"
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-all"
                  >
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </>
              )}
              <div className="bg-green-deep text-cream px-3 py-1.5 rounded-xl font-mono text-[13px] font-bold tracking-wider uppercase shadow-md">
                {booking.vehicle.licensePlate}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Upcoming({ onShowAll }: { onShowAll: () => void }) {
  return (
    <div className="floating-card-static p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-lg lg:text-xl font-sans font-bold text-green-deep">Nadchodzące</h4>
          <p className="text-[11px] font-semibold text-green-light/60 uppercase tracking-wide mt-1">
            następne {upcomingBookings.length} rezerwacji
          </p>
        </div>
        <button
          type="button"
          onClick={onShowAll}
          className="text-[9px] font-semibold text-green-light uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
        >
          Wszystkie <ChevronRight size={13} />
        </button>
      </div>
      <div className="space-y-2">
        {upcomingBookings.slice(0, 4).map((booking) => (
          <div
            key={booking.id}
            className="p-4 rounded-xl flex items-center gap-5 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.07)]"
            style={ROW}
          >
            <div
              className="text-center shrink-0 min-w-[50px] border-r pr-4"
              style={{ borderColor: 'rgba(26,46,30,0.08)' }}
            >
              <p className="text-xl font-bold text-green-deep font-mono leading-none">{dayOf(booking.scheduledAt)}</p>
              <p className="text-[8px] font-bold text-green-light/60 uppercase tracking-wider">
                {shortMonthOf(booking.scheduledAt)}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-bold text-green-deep truncate">
                {booking.vehicle.brand} {booking.vehicle.model}
              </h5>
              <p className="text-[9px] font-bold text-green-deep/30 uppercase tracking-widest truncate">
                {booking.services.join(', ')}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-base font-bold text-green-deep font-mono">
                XXX <span className="text-[9px] text-green-deep/35">zł</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The demo's home screen: greeting, stats, today's schedule, upcoming bookings and the side widgets. */
export function DashboardView({ onShowBookings }: { onShowBookings: () => void }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <DemoHeader title="Panel" subtitle="Studio Demo Detailing" />
      <Greeting />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Przychód Dziś"
          value="XXX zł"
          sub="+12%"
          iconBg="#1a2e1e"
          iconColor="#f5f0e8"
        />
        <StatCard
          icon={Clock}
          label="Aktywne Zlecenia"
          value="5"
          sub="3 dziś"
          iconBg="rgba(232,168,48,0.12)"
          iconColor="#e8a830"
        />
        <StatCard
          icon={Users}
          label="Baza Klientów"
          value="7"
          sub="aktywni"
          iconBg="rgba(61,107,70,0.1)"
          iconColor="#3d6b46"
        />
        <StatCard
          icon={CheckCircle2}
          label="Ukończone"
          value="2"
          sub="łącznie"
          iconBg="rgba(34,197,94,0.1)"
          iconColor="#22c55e"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
          <TodaySchedule />
          <Upcoming onShowAll={onShowBookings} />
        </div>
        <DashboardSideColumn lowStockItems={lowStockItems} />
      </div>
    </div>
  );
}
