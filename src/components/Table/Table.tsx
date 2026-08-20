import type { ReactNode } from 'react';
import styled from 'styled-components';

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: ${({ theme }) => theme.space.sm}px;
    text-align: left;
    font: ${({ theme }) => theme.font.body14};
    border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
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
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
}

// TODO: sorting, pagination, empty/loading states.
export function Table<T extends Record<string, unknown>>({ columns, data }: TableProps<T>) {
  return (
    <StyledTable>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={col.key}>
                {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </StyledTable>
  );
}
