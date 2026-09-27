import styled from 'styled-components';

// docs/design-system.md → Page Header: display title + label meta line on the
// left, actions on the right ([secondary …] [primary] — primary last, max one).
export const PageHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space.md}px;
  margin-bottom: var(--space-8);

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: var(--space-6);
  }
`;

export const PageTitle = styled.h1`
  font: ${({ theme }) => theme.type.display};
  letter-spacing: var(--type-display-tracking);
  color: ${({ theme }) => theme.color.text.primary};
  text-wrap: balance;
`;

export const PageSubtitle = styled.p`
  margin-top: 4px;
  font: ${({ theme }) => theme.type.label};
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.space.xs}px;

  ${({ theme }) => theme.media.mobile} {
    & > * {
      flex: 1 1 auto;
    }
  }
`;
