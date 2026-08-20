import styled from 'styled-components';

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 46px;
  border: none;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background: ${({ theme }) => theme.color.text.primary};
  color: #121315;
  font: ${({ theme }) => theme.font.body14b};
  cursor: pointer;
  transition: filter 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(0.95);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Icon = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.accent.blue};
  flex-shrink: 0;
`;

export interface LoginButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

// TODO: implement real Google OAuth button once client ID / SDK wiring is in place.
export function LoginButton({ onClick, disabled }: LoginButtonProps) {
  return (
    <StyledButton type="button" onClick={onClick} disabled={disabled}>
      <Icon />
      Google 계정으로 계속하기
    </StyledButton>
  );
}
