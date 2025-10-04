import React from 'react';
import clsx from 'clsx';
import { useLanguage } from '../../contexts/LanguageContext';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  loading?: boolean;
}

export default function Table({ children, loading, className, ...props }: TableProps) {
  const { t, isRTL } = useLanguage();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner" />
        <span className={clsx('text-gray-600', isRTL ? 'mr-3' : 'ml-3')}>{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className={clsx(
          'min-w-full divide-y divide-gray-200',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

Table.Head = function TableHead({ children, className, ...props }: TableHeadProps) {
  return (
    <thead className={clsx('bg-gray-50', className)} {...props}>
      {children}
    </thead>
  );
};

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

Table.Body = function TableBody({ children, className, ...props }: TableBodyProps) {
  return (
    <tbody className={clsx('bg-white divide-y divide-gray-200', className)} {...props}>
      {children}
    </tbody>
  );
};

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

Table.Row = function TableRow({ children, className, ...props }: TableRowProps) {
  return (
    <tr className={clsx('hover:bg-gray-50 transition-colors', className)} {...props}>
      {children}
    </tr>
  );
};

interface TableThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

Table.Th = function TableTh({ children, className, ...props }: TableThProps) {
  const { isRTL } = useLanguage();
  
  return (
    <th
      className={clsx(
        'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
        isRTL ? 'text-right' : 'text-left',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

interface TableTdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

Table.Td = function TableTd({ children, className, ...props }: TableTdProps) {
  const { isRTL } = useLanguage();
  
  return (
    <td className={clsx(
      'px-6 py-4 whitespace-nowrap text-sm',
      isRTL ? 'text-right' : 'text-left',
      className
    )} {...props}>
      {children}
    </td>
  );
};

