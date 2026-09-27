import styled, { css } from 'styled-components';

// Same control spec as Button: 36px, raised fill, default border, radius 8.
// Focus goes neutral (no blue — it reads as team blue).
const control = css`
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.control}px;
  border: 1px solid ${({ theme }) => theme.color.border.strong};
  background: ${({ theme }) => theme.color.surface.subtle};
  color: ${({ theme }) => theme.color.text.primary};
  font: ${({ theme }) => theme.type.body};
  transition: border-color var(--duration-fast) var(--ease-out);

  &::placeholder {
    color: ${({ theme }) => theme.color.text.muted};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.text.secondary};
  }

  &[aria-invalid='true'] {
    border-color: ${({ theme }) => theme.color.state.dangerLine};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  ${control}
  height: var(--control-height);
  padding: 0 ${({ theme }) => theme.space.sm}px;

  ${({ theme }) => theme.media.mobile} {
    height: 40px;
  }
`;

export const Textarea = styled.textarea`
  ${control}
  padding: 10px ${({ theme }) => theme.space.sm}px;
  resize: vertical;
`;
