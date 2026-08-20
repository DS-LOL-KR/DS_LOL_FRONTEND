import 'styled-components';
import type { theme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Omit<typeof theme, never> {}
}
