import React from 'react';
import * as Icons from 'lucide-react';

/**
 * EmptyState component for uniform "No Data" screens across modules.
 * @param {string} icon - Lucide icon name (e.g. "Trophy", "Bell").
 * @param {string} iconColor - Hex or Tailwind class for icon color.
 * @param {string} title - Main heading.
 * @param {string} description - Subtext explaining the state.
 * @param {string} actionLabel - Optional CTA text.
 * @param {function} onAction - Optional CTA click handler.
 * @param {string} size - Size variant (sm, md, lg).
 */
export default function EmptyState({ 
  icon, 
  iconColor = "text-primary", 
  iconBgClass = "bg-primary/5",
  iconBorderClass = "border-[#ffedd5]",
  title, 
  description, 
  actionLabel, 
  onAction, 
  actionClassName = "bg-primary hover:bg-primary/90",
  size = "md" 
}) {
  const IconComponent = Icons[icon] || Icons.HelpCircle;
  
  const sizeClasses = {
    sm: { container: "py-8", icon: "w-12 h-12", iconSize: 20, title: "text-base", desc: "text-xs" },
    md: { container: "py-16", icon: "w-16 h-16", iconSize: 28, title: "text-xl", desc: "text-sm" },
    lg: { container: "py-24", icon: "w-20 h-20", iconSize: 36, title: "text-2xl", desc: "text-base" },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 ${currentSize.container}`}>
      {/* Icon Circle */}
      <div className={`${currentSize.icon} ${iconBgClass} rounded-3xl flex items-center justify-center ${iconColor} mb-6 shadow-sm border ${iconBorderClass}`}>
        <IconComponent size={currentSize.iconSize} strokeWidth={1.5} />
      </div>

      {/* Text Content */}
      <h3 className={`font-extrabold text-[#171717] font-headline mb-2 ${currentSize.title}`}>
        {title}
      </h3>
      <p className={`text-[#737373] max-w-sm mx-auto mb-8 font-medium leading-relaxed ${currentSize.desc}`}>
        {description}
      </p>

      {/* Optional CTA */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`px-6 py-3 text-white rounded-2xl font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${actionClassName}`}
        >
          {actionLabel}
          <Icons.ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
