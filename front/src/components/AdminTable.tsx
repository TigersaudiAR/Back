import { useMemo } from "react";

interface AdminTableProps<T> {
  data: T[];
  columns: { key: keyof T; header: string; render?: (value: any, row: T) => React.ReactNode }[];
  actions?: (row: T) => React.ReactNode;
}

function AdminTable<T extends { id?: string | number }>({ data, columns, actions }: AdminTableProps<T>) {
  const headers = useMemo(() => columns.map((column) => column.header), [columns]);

  return (
    <div className="overflow-x-auto bg-primary-dark/60 border border-primary-light/30 rounded-3xl">
      <table className="table table-zebra text-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
            {actions && <th>إجراءات</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={(row.id as string) ?? index}>
              {columns.map((column) => (
                <td key={String(column.key)}>
                  {column.render
                    ? column.render(row[column.key], row)
                    : ((row[column.key] as React.ReactNode) ?? "-")}
                </td>
              ))}
              {actions && <td>{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTable;
