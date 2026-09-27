import styled from 'styled-components';

// docs/design-system.md → App Shell & Grid. 12 columns, 12px gap.
// ≤1100px: span 3 → 6, span 4/8 → 12. ≤720px: 2 columns — KPI (span 3) takes
// one, everything else the full width.
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--card-gap);

  ${({ theme }) => theme.media.mobile} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

type Span = 3 | 4 | 5 | 6 | 7 | 8 | 12;

export const Col = styled.div<{ $span: Span }>`
  grid-column: span ${({ $span }) => $span};
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--card-gap);

  /* A card that is the only child fills the column so row heights line up. */
  & > :only-child {
    flex: 1;
  }

  ${({ theme }) => theme.media.wide} {
    grid-column: span ${({ $span }) => ($span === 3 ? 6 : $span === 6 || $span === 12 ? $span : 12)};
  }

  ${({ theme }) => theme.media.mobile} {
    grid-column: span ${({ $span }) => ($span === 3 ? 1 : 2)};
  }
`;

// Vertical rhythm between page sections (40px) and between grid rows (12px).
export const Stack = styled.div<{ $gap?: 'card' | 'section' }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 'section' }) => ($gap === 'card' ? 'var(--card-gap)' : 'var(--section-gap)')};
  min-width: 0;
`;
