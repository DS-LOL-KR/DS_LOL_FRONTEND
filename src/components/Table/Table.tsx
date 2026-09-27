import type { ReactNode } from 'react';
import styled from 'styled-components';

// docs/design-system.md → Table. Meant to sit in a flush Card: header in
// caption/muted, 52px rows split by subtle hairlines, hover lifts to bg-hover,
// outer cells padded to the card's 20px. Team rows get a 3px left bar.
const Scroller = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

type Team = 'red' | 'blue';

const StyledTable = styled.table<{ $minWidth?: number; $clickable?: boolean }>`
  width: 100%;
  min-width: ${({ $minWidth }) => ($minWidth ? `${$minWidth}px` : 'auto')};
  table-layout: fixed;
  border-collapse: collapse;

  th,
  td {
    padding: 0 ${({ theme }) => theme.space.sm}px;
    text-align: left;
    vertical-align: middle;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-variant-numeric: tabular-nums;
  }

  th:first-child,
  td:first-child {
    padding-left: var(--card-padding);
  }

  th:last-child,
  td:last-child {
    padding-right: var(--card-padding);
  }

  th {
    height: 40px;
    font: ${({ theme }) => theme.type.caption};
    color: ${({ theme }) => theme.color.text.muted};
    border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
  }

  td {
    height: var(--table-row-height);
    font: ${({ theme }) => theme.type.body};
    color: ${({ theme }) => theme.color.text.primary};
    border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }

  tbody tr {
    transition: background var(--duration-fast) var(--ease-out);
    cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  }

  tbody tr:hover {
    background: ${({ theme }) => theme.color.surface.hover};
  }

  tr[data-team] td:first-child {
    position: relative;
  }

  tr[data-team] td:first-child::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    bottom: 20%;
    width: 3px;
    border-radius: 0 2px 2px 0;
  }

  tr[data-team='red'] td:first-child::before {
    background: ${({ theme }) => theme.color.team.red};
  }

  tr[data-team='blue'] td:first-child::before {
    background: ${({ theme }) => theme.color.team.blue};
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
  /** Team marker (3px left bar) per row, for match rosters. */
  rowTeam?: (row: T) => Team | null | undefined;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T, index: number) => string | number;
}

export function Table<T extends object>({ columns, data, minWidth, rowTeam, onRowClick, rowKey }: TableProps<T>) {
  return (
    <Scroller>
      <StyledTable $minWidth={minWidth} $clickable={!!onRowClick}>
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
            <tr
              key={rowKey ? rowKey(row, i) : i}
              data-team={rowTeam?.(row) ?? undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
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
