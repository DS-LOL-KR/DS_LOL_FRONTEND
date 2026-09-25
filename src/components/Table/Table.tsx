import type { ReactNode } from 'react';
import styled from 'styled-components';

// Dense rows don't reflow well into a phone width — below `minWidth` the table
// scrolls sideways inside its own box instead of pushing the whole page wider.
const Scroller = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const StyledTable = styled.table<{ $minWidth?: number }>`
  width: 100%;
  min-width: ${({ $minWidth }) => ($minWidth ? `${$minWidth}px` : 'auto')};
  table-layout: fixed;
  border-collapse: collapse;

  th,
  td {
    padding: ${({ theme }) => theme.space.sm}px;
    text-align: left;
    font: ${({ theme }) => theme.font.body14};
    font-variant-numeric: tabular-nums;
    vertical-align: middle;
    border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  th {
    color: ${({ theme }) => theme.color.text.secondary};
    font: ${({ theme }) => theme.font.label12m};
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
  /** Width (px) below which the table scrolls horizontally instead of squeezing. */
  minWidth?: number;
}

// TODO: sorting, pagination, empty/loading states.
export function Table<T extends object>({ columns, data, minWidth }: TableProps<T>) {
  return (
    <Scroller>
      <StyledTable $minWidth={minWidth}>
        <colgroup>
          {columns.map((col) => (
            <col key={col.key} style={col.width ? { width: col.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ textAlign: col.align ?? 'left' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align ?? 'left' }}>
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </Scroller>
  );
}
