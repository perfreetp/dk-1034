import React from 'react';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, children, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
};

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const TableRow: React.FC<TableRowProps> = ({ children, onClick, className = '' }) => {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-slate-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export const TableCell: React.FC<TableCellProps> = ({ children, className = '', colSpan }) => {
  return <td colSpan={colSpan} className={`px-6 py-4 text-sm text-slate-700 ${className}`}>{children}</td>;
};
