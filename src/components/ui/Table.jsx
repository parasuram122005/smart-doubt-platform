import React from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

export const Table = ({ columns, data, onRowClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-theme-card p-12 text-center text-theme-text-muted rounded-2xl border border-theme-border/50 shadow-sm">
        No records found.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-theme-card rounded-2xl border border-theme-border/50 shadow-soft">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-theme-bg/50 border-b border-theme-border/60">
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 text-xs font-bold text-theme-text-muted uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-theme-border/40">
          {data.map((row, r_idx) => (
            <motion.tr 
              key={row._id || r_idx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: r_idx * 0.05 }}
              onClick={() => onRowClick && onRowClick(row)}
              className={cn(
                "transition-colors",
                onRowClick ? "cursor-pointer hover:bg-theme-bg/60" : "hover:bg-theme-bg/20"
              )}
            >
              {columns.map((col, c_idx) => (
                <td key={c_idx} className="px-6 py-4 text-sm text-theme-text align-middle">
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
