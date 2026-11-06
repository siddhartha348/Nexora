import { Badge } from '../ui/Badge';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  highlight?: string;
  description?: string;
  telemetry?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  highlight,
  description,
  telemetry,
  align = 'center',
  className = '',
}: SectionHeaderProps) {
  const isCenter = align === 'center';

  return (
    <div className={`space-y-3 ${isCenter ? 'text-center mx-auto max-w-3xl' : 'max-w-2xl'} ${className}`}>
      {telemetry && (
        <span className="text-[10px] font-mono tracking-widest text-cyber-cyan/80 uppercase block">
          // {telemetry}
        </span>
      )}
      {badge && (
        <Badge variant="cyber" dot size="sm">
          {badge}
        </Badge>
      )}
      
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-text tracking-tight">
        {title} {highlight && <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-glacial to-white">{highlight}</span>}
      </h2>

      {description && (
        <p className="text-xs sm:text-sm text-slate-muted leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

