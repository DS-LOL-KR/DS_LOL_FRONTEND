import type { ReactNode } from 'react';
import styled from 'styled-components';

const StyledTable = styled.table`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;

  th, td {
    padding: ${({ theme }) => theme.space.sm}px;
    text-align: left;
    font: ${({ theme }) => theme.font.body14};
    border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
    overflow: hidden;
  }

  th {
    color: ${({ theme }) => theme.color.text.secondary};
    font: ${({ theme }) => theme.font.small13b};
  }

  tr:nth-child(even) td {
    background: ${({ theme }) => theme.color.surface.row};
  }
`;

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  /** Fixed column width (px). Without this, `table-layout: fixed` splits width evenly,
   * which is almost never what a numeric/action column wants. */
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
}

// TODO: sorting, pagination, empty/loading states.
export function Table<T extends object>({ columns, data }: TableProps<T>) {
  return (
    <StyledTable>
      <colgroup>
        {columns.map((col) => (
          <col key={col.key} style={col.width ? { width: col.width } : undefined} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} style={{ textAlign: col.align ?? 'left' }}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={col.key} style={{ textAlign: col.align ?? 'left' }}>
                {col.render
                  ? col.render(row)
                  : String((row as Record<string, unknown>)[col.key] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </StyledTable>
  );
}
