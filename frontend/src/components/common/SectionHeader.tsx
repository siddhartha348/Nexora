import { Badge } from '../ui/Badge';

interface SectionHeaderProps {
  badge?: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  highlight,
  description,
  align = 'center',
  className = '',
}: SectionHeaderProps) {
  const isCenter = align === 'center';

  return (
    <div className={`space-y-3 ${isCenter ? 'text-center mx-auto max-w-3xl' : 'max-w-2xl'} ${className}`}>
      {badge && (
        <Badge variant="primary" dot size="sm">
          {badge}
        </Badge>
      )}
      
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-text tracking-tight">
        {title} {highlight && <span className="text-glacial">{highlight}</span>}
      </h2>

      {description && (
        <p className="text-xs sm:text-sm text-slate-muted leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

