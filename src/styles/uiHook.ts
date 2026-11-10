// 스킨 CSS(src/styles/skins/*.css)가 컴포넌트를 잡을 수 있게 붙이는 data-* 속성.
// styled-components의 클래스명은 해시라 바깥 CSS에서 못 잡아서, 이 속성만 고정 이름으로 둔다.
// classic 스킨에는 아무 효과가 없다. (attrs 타입에 data-* 가 없어서 빈 객체 타입으로 캐스팅)
type NoProps = Record<never, never>;

export const ui = (name: string, extra: Record<string, string | undefined> = {}): NoProps =>
  ({ 'data-ui': name, ...extra }) as NoProps;
