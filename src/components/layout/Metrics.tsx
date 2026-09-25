import styled from 'styled-components';

// The divided stat strip under a page header (MMR, 승률, 밸런스 …). Four across
// on desktop; on a phone it becomes a 2×2 grid so values keep their size
// instead of wrapping one character per line.
export const Metrics = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.space.md}px 0;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};

  ${({ theme }) => theme.media.mobile} {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: ${({ theme }) => theme.space.md}px;
  }
`;

export const Metric = styled.div`
  flex: 1;
  min-width: 0;
  padding-left: 28px;
  border-left: 1px solid ${({ theme }) => theme.color.border.base};

  &:first-child {
    padding-left: 0;
    border-left: none;
  }

  ${({ theme }) => theme.media.mobile} {
    padding-left: ${({ theme }) => theme.space.md}px;

    &:nth-child(odd) {
      padding-left: 0;
      border-left: none;
    }
  }
`;

export const MetricLabel = styled.p`
  font: ${({ theme }) => theme.font.label12m};
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const MetricValue = styled.p`
  margin-top: 5px;
  white-space: nowrap;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.color.text.primary};

  ${({ theme }) => theme.media.mobile} {
    font-size: 24px;
  }
`;

export const MetricUnit = styled.span`
  margin-left: 2px;
  font-size: 0.6em;
  font-weight: 500;
  letter-spacing: 0;
  color: ${({ theme }) => theme.color.text.secondary};
`;
