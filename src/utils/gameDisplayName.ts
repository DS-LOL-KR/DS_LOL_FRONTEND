// 백엔드 games.name은 영문("League of Legends")이라 좁은 칩/컬럼에서 글자가
// 튀어나오는 문제가 있었음(2026-09-13 문의) — 화면에 보여줄 땐 한글 이름으로 바꿔치기.
// code가 목록에 없으면(새 게임 추가 등) 원래 name을 그대로 씀.
const GAME_DISPLAY_NAME: Record<string, string> = {
  LOL: '리그 오브 레전드',
  VALORANT: '발로란트',
};

export function getGameDisplayName(game: { code: string; name: string }): string {
  return GAME_DISPLAY_NAME[game.code] ?? game.name;
}
