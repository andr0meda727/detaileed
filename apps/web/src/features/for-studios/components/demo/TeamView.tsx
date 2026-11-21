import { Mail, Search, Trash2, UserPlus, Users } from 'lucide-react';
import { MOCK_EMPLOYEES } from '../../model/demoData';
import { DemoHeader } from './DemoHeader';

/** The demo's team screen. */
export function TeamView() {
  return (
    <div className="space-y-8 pb-20">
      <DemoHeader title="Zespół" subtitle="Zarządzaj Pracownikami w Studiu" />

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex-1 relative group max-w-sm">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            aria-label="Szukaj osoby"
            placeholder="Szukaj osoby..."
            className="w-full pl-14 pr-8 py-4 bg-white border border-slate-100 rounded-xl font-bold text-sm outline-none shadow-sm focus:border-cream-warm/40 transition-all"
          />
        </div>
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-8 py-4 bg-green-deep text-cream rounded-xl font-semibold text-[11px] uppercase tracking-widest hover:shadow-xl transition-all"
        >
          <UserPlus size={16} /> Zaproś do Zespołu
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-xl sm:text-2xl font-bold text-green-deep tracking-tight flex items-center gap-3">
            <Users className="text-amber" /> Kadra Pracownicza
            <span className="text-xs font-semibold text-slate-400 py-1 px-3 bg-slate-50 rounded-full">
              {MOCK_EMPLOYEES.length} OSÓB
            </span>
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_EMPLOYEES.map((emp) => (
            <div
              key={emp.userId}
              className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-cream"
                    style={{ backgroundColor: '#1a2e1e' }}
                  >
                    {emp.name[0]}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-xl ${emp.color}`}>
                    {emp.role}
                  </span>
                </div>
                <h5 className="text-lg font-bold text-green-deep mb-1 truncate">{emp.name}</h5>
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
          ))}
        </div>
      </div>
    </div>
  );
}
