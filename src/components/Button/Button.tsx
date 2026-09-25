import styled, { css } from 'styled-components';

type Variant = 'primary' | 'ghost' | 'danger' | 'dangerGhost';
type Size = 'md' | 'sm';

export const Button = styled.button<{ $variant?: Variant; $size?: Size }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  transition:
    filter 0.15s ease,
    transform 0.16s cubic-bezier(0.22, 1, 0.36, 1);

  ${({ $size = 'md', theme }) =>
    $size === 'sm'
      ? css`
          height: 36px;
          padding: 0 14px;
          /* Figma spec buttons are 4-5px, not the 8-12px theme.radius scale —
             kept literal here since that scale is shared with unrelated things
             (cards, tier badges) that weren't part of this ask. */
          border-radius: 4px;
          font: ${theme.font.small13b};
        `
      : css`
          height: 44px;
          padding: 0 22px;
          border-radius: 6px;
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

  &:hover:not(:disabled) { filter: brightness(1.12); }
  &:active:not(:disabled) { transform: scale(0.97); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
