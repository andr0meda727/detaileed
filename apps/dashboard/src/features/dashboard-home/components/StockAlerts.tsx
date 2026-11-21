import React from 'react';
import { Package } from 'lucide-react';
import type { InventoryItem } from '@/features/inventory';
import { Skeleton } from '@detaileed/ui';
interface StockAlertsProps {
  items: InventoryItem[];
  loading: boolean;
}

/** Inventory items below their minimum stock. */
export const StockAlerts: React.FC<StockAlertsProps> = ({ items: lowStockItems, loading: showLoading }) => {
  return (
    <div className="floating-card-static p-6 sm:p-7">
      <div className="flex items-center justify-between mb-5">
        <h4 className="text-lg font-sans font-bold text-green-deep">Alerty Magazynowe</h4>
        <div
          className={`w-9 h-9 rounded-[0.875rem] flex items-center justify-center ${lowStockItems.length > 0 ? 'bg-amber/15 text-amber' : 'bg-green-pale/40 text-green-light'}`}
        >
          <Package size={16} />
        </div>
      </div>
      {showLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl flex items-center justify-between bg-slate-50 border border-slate-100"
            >
              <div className="flex-1 flex flex-col justify-center gap-2">
                <Skeleton width="60%" height="14px" className="rounded-md" />
                <Skeleton width="40%" height="10px" className="rounded-sm" />
              </div>
              <Skeleton width="40px" height="24px" className="rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="">
          {lowStockItems.length === 0 ? (
            <div className="text-center py-5">
              <div className="w-10 h-10 bg-green-pale/40 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-light text-lg">✓</span>
              </div>
              <p className="text-sm font-semibold text-green-deep/50">Wszystko w normie</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl flex items-center justify-between"
                  style={{ background: 'rgba(232,168,48,0.07)', border: '1px solid rgba(232,168,48,0.15)' }}
                >
                  <div>
                    <h5 className="text-[13px] font-bold text-green-deep truncate">{item.name}</h5>
                    <p className="text-[10px] font-semibold text-amber uppercase tracking-widest">
                      {item.categoryName || 'Brak kategorii'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-amber font-mono">
                      {item.stock}
                      <span className="text-[11px] ml-0.5 opacity-60">{item.unit}</span>
                    </p>
                    <p className="text-[10px] font-semibold text-green-deep/35 uppercase">min. {item.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
