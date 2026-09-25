import styled from 'styled-components';

// Every authed page opens with the same title block + right-aligned actions.
// It used to be re-declared per page (identical CSS ×9), which is how the
// mobile layout ended up missing everywhere at once — one definition now.
export const PageHeader = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space.md}px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.base};

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const PageTitle = styled.h1`
  font: ${({ theme }) => theme.font.title26};
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.color.text.primary};
  text-wrap: balance;

  ${({ theme }) => theme.media.mobile} {
    font-size: 28px;
  }
`;

export const PageSubtitle = styled.p`
  margin-top: 6px;
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const HeaderActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.xs}px;

  ${({ theme }) => theme.media.mobile} {
    & > * {
      flex: 1 1 auto;
    }
  }
`;
