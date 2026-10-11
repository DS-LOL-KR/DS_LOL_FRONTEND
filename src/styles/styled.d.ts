import 'styled-components';
import type { theme } from './theme';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- 모듈 보강은 interface 병합이어야 해서 빈 interface가 필요함
  export interface DefaultTheme extends Omit<typeof theme, never> {}
}
