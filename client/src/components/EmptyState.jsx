import React from "react";

export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      {Icon && (
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-5">
          <Icon size={28} className="text-slate-500" />
        </div>
      )}
      <h3 className="text-slate-300 font-semibold text-lg mb-2">{title}</h3>
      {subtitle && <p className="text-slate-500 text-sm max-w-xs">{subtitle}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary mt-6">
          {actionLabel}
        </button>
      )}
    </div>
  );
}