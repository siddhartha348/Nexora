import React from 'react';
import { cn } from '../../utils/cn';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className="w-full overflow-x-auto rounded-none border-2 border-obsidian-700 bg-obsidian-850 shadow-neo">
    <table className={cn("w-full text-left text-sm text-slate-text border-collapse", className)} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => (
  <thead
    className={cn(
      "bg-obsidian-800 border-b-2 border-obsidian-700 text-xs uppercase tracking-wider text-slate-muted font-bold font-mono",
      className
    )}
    {...props}
  />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => (
  <tbody
    className={cn("divide-y divide-slate-border/40", className)}
    {...props}
  />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  ...props
}) => (
  <tr
    className={cn(
      "transition-colors hover:bg-obsidian-700/50 group select-none",
      className
    )}
    {...props}
  />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  ...props
}) => (
  <th className={cn("px-4 py-3 font-semibold", className)} {...props} />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  ...props
}) => (
  <td className={cn("px-4 py-3 align-middle text-slate-text/90", className)} {...props} />
);

