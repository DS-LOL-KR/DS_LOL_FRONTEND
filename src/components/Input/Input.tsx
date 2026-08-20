import styled from 'styled-components';

// TODO: add error state, left/right icon slots once designs land.
export const Input = styled.input`
  height: 40px;
  width: 100%;
  padding: 0 ${({ theme }) => theme.space.sm}px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  border: 1px solid ${({ theme }) => theme.color.border.base};
  background: ${({ theme }) => theme.color.surface.subtle};
  color: ${({ theme }) => theme.color.text.primary};
  font: ${({ theme }) => theme.font.body14};

  &::placeholder {
    color: ${({ theme }) => theme.color.text.secondary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.accent.blue};
  }
`;

// TODO: add error state, char counter once designs land.
export const Textarea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.space.sm}px ${({ theme }) => theme.space.md}px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  border: 1px solid ${({ theme }) => theme.color.border.base};
  background: ${({ theme }) => theme.color.surface.subtle};
  color: ${({ theme }) => theme.color.text.primary};
  font: ${({ theme }) => theme.font.body14};
  resize: vertical;

  &::placeholder {
    color: ${({ theme }) => theme.color.text.secondary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.accent.blue};
  }
`;
