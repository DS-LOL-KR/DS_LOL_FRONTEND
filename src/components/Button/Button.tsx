import styled, { css } from 'styled-components';

type Variant = 'primary' | 'ghost' | 'danger' | 'dangerGhost';
type Size = 'md' | 'sm';

export const Button = styled.button<{ $variant?: Variant; $size?: Size }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: filter 0.15s ease;

  ${({ $size = 'md', theme }) =>
    $size === 'sm'
      ? css`
          height: 32px;
          padding: 0 12px;
          border-radius: ${theme.radius.sm}px;
          font: ${theme.font.small13b};
        `
      : css`
          height: 44px;
          padding: 0 22px;
          border-radius: ${theme.radius.md}px;
          font: ${theme.font.body14b};
        `}

  ${({ $variant = 'primary', theme }) => {
    if ($variant === 'ghost')
      return css`
        background: ${theme.color.surface.subtle};
        border: 1px solid ${theme.color.border.base};
        color: ${theme.color.text.primary};
      `;
    if ($variant === 'danger')
      return css`
        background: ${theme.color.state.danger};
        color: ${theme.color.text.primary};
      `;
    if ($variant === 'dangerGhost')
      return css`
        background: ${theme.color.surface.subtle};
        border: 1px solid ${theme.color.state.danger};
        color: ${theme.color.state.danger};
      `;
    return css`
      background: ${theme.color.text.primary};
      color: #121315;
    `;
  }}

  &:hover:not(:disabled) { filter: brightness(1.08); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
