import styled from 'styled-components';

// Two data columns divided by a hairline (최근 매치 | 챔피언 전적, MMR 추이 | 변동
// 내역). Stacks on a phone, where the divider turns horizontal.
export const SplitColumns = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;

  ${({ theme }) => theme.media.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SplitPrimary = styled.div`
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.space.lg}px 40px ${({ theme }) => theme.space.lg}px 0;

  ${({ theme }) => theme.media.mobile} {
    padding-right: 0;
  }
`;

export const SplitSecondary = styled.div`
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.space.lg}px 0 ${({ theme }) => theme.space.lg}px 40px;
  border-left: 1px solid ${({ theme }) => theme.color.border.base};

  ${({ theme }) => theme.media.mobile} {
    padding-left: 0;
    border-left: none;
    border-top: 1px solid ${({ theme }) => theme.color.border.base};
  }
`;
