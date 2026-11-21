import { Calendar, Download, FileBarChart2 } from 'lucide-react';
import { DemoHeader } from './DemoHeader';

const LABEL = 'text-[10px] font-semibold text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2';
const INPUT = 'w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-sm text-green-deep';

/** The demo's report export form. */
export function ReportsView() {
  return (
    <div className="space-y-8 pb-20">
      <DemoHeader title="Raporty" subtitle="Eksport Danych i Analizy" />

      <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 border border-slate-100 shadow-sm max-w-3xl">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-14 h-14 bg-green-deep rounded-2xl flex items-center justify-center text-cream shadow-lg shrink-0">
            <FileBarChart2 size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-xl sm:text-2xl font-bold text-green-deep tracking-tight">Raport Rezerwacji</h4>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
              Wygeneruj zestawienie finansowe wizyt
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="demo-report-from" className={LABEL}>
                <Calendar size={12} /> Data Od
              </label>
              <input id="demo-report-from" type="date" className={INPUT} />
            </div>
            <div className="space-y-2">
              <label htmlFor="demo-report-to" className={LABEL}>
                <Calendar size={12} /> Data Do
              </label>
              <input id="demo-report-to" type="date" className={INPUT} />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              className="w-full sm:w-auto px-8 py-5 bg-green-deep text-cream rounded-xl font-semibold text-[11px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <Download size={18} /> Pobierz Raport
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
