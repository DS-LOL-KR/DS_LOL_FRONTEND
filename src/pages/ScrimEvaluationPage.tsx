import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../components/Button/Button';
import { useSubmitRating } from '../features/ratings/hooks';

type RatingOption = '아쉬웠어요' | '무난했어요' | '좋았어요';
const RATING_OPTIONS: RatingOption[] = ['아쉬웠어요', '무난했어요', '좋았어요'];
const RATING_SCORE: Record<RatingOption, number> = { 아쉬웠어요: 1, 무난했어요: 2, 좋았어요: 3 };

interface Teammate {
  id: string;
  name: string;
  lane: string;
  tier: 1 | 2 | 3 | 4 | 5;
  kda: string;
}

// TODO: no /matches/:id/teammates endpoint yet — swap this mock for a real query
// once the 기능명세서 "사용자 평가" API lands.
const TEAMMATES: Teammate[] = [
  { id: '1', name: '민석', lane: 'JGL', tier: 2, kda: '4 / 2 / 13' },
  { id: '2', name: '성현', lane: 'MID', tier: 1, kda: '9 / 3 / 7' },
  { id: '3', name: '지우', lane: 'BOT', tier: 2, kda: '11 / 4 / 5' },
  { id: '4', name: '태윤', lane: 'SUP', tier: 3, kda: '1 / 6 / 18' },
];

const Screen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: ${({ theme }) => theme.space.xl}px;
`;

const Panel = styled.div`
  width: 720px;
  padding: 26px 32px 22px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border: 1px solid ${({ theme }) => theme.color.border.base};
  background: ${({ theme }) => theme.color.surface.subtle};
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PanelTitle = styled.p`
  font: ${({ theme }) => theme.font.title22};
  letter-spacing: -0.3px;
  color: ${({ theme }) => theme.color.text.primary};
`;

const ResultRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResultLabel = styled.span`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.state.success};
`;

const ResultKda = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const MatchInfo = styled.p`
  margin-top: 6px;
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  background: ${({ theme }) => theme.color.border.base};
  width: 100%;
  margin: 18px 0 0;
`;

const ProgressRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 12px;
`;

const ProgressHint = styled.span`
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ProgressCount = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.primary};
`;

const TeammateRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space.md}px;
  padding: 14px 0;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};

  &:last-of-type {
    border-bottom: 1px solid ${({ theme }) => theme.color.border.base};
  }
`;

const TeammateInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TeammateAvatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background: ${({ theme }) => theme.color.surface.subtle};
  flex-shrink: 0;
`;

const TeammateNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TeammateName = styled.span`
  font: ${({ theme }) => theme.font.body14b};
  color: ${({ theme }) => theme.color.text.primary};
`;

const TeammateLane = styled.span`
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const TeammateTier = styled.span<{ $tier: 1 | 2 | 3 | 4 | 5 }>`
  font: ${({ theme }) => theme.font.label12};
  color: ${({ theme, $tier }) => theme.color.tier[$tier]};
`;

const TeammateKda = styled.span`
  display: block;
  margin-top: 3px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const OptionRow = styled.div`
  display: flex;
  gap: 6px;
`;

const OptionChip = styled.button<{ $selected: boolean }>`
  padding: 8px 13px;
  border-radius: 4px;
  cursor: pointer;
  font: ${({ theme, $selected }) => ($selected ? theme.font.small13b : theme.font.small13)};
  background: ${({ theme, $selected }) => ($selected ? theme.color.text.primary : 'transparent')};
  border: 1px solid ${({ theme, $selected }) => ($selected ? theme.color.text.primary : theme.color.border.base)};
  color: ${({ theme, $selected }) => ($selected ? '#121315' : theme.color.text.secondary)};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.color.border.base};
  margin-top: 4px;
`;

const AnonymousHint = styled.span`
  font: ${({ theme }) => theme.font.caption11};
  color: ${({ theme }) => theme.color.text.secondary};
`;

const FooterActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.xs}px;
`;

export function ScrimEvaluationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const submitRating = useSubmitRating();
  const [ratings, setRatings] = useState<Record<string, RatingOption>>({});

  const completedCount = Object.keys(ratings).length;

  const handleSelect = (teammateId: string, option: RatingOption) => {
    setRatings((prev) => ({ ...prev, [teammateId]: option }));
  };

  const handleSubmit = () => {
    if (!id) return;
    Promise.all(
      Object.entries(ratings).map(([targetId, option]) =>
        submitRating.mutateAsync({ matchId: id, targetId, score: RATING_SCORE[option] }),
      ),
    ).then(() => navigate(`/scrims/${id}`));
  };

  return (
    <Screen>
      <Panel>
        <PanelHeader>
          <PanelTitle>팀원 평가</PanelTitle>
          <ResultRow>
            <ResultLabel>승리</ResultLabel>
            <ResultKda>9 / 2 / 11</ResultKda>
          </ResultRow>
        </PanelHeader>
        <MatchInfo>08.08 02:40 · 리그 오브 레전드 5v5 · 전적은 자동으로 불러왔어요</MatchInfo>
        <Divider />
        <ProgressRow>
          <ProgressHint>평가는 다음 내전의 팀 밸런스와 그룹 티어에 반영돼요</ProgressHint>
          <ProgressCount>{completedCount} / {TEAMMATES.length}명 완료</ProgressCount>
        </ProgressRow>

        {TEAMMATES.map((mate) => (
          <TeammateRow key={mate.id}>
            <TeammateInfo>
              <TeammateAvatar />
              <div>
                <TeammateNameRow>
                  <TeammateName>{mate.name}</TeammateName>
                  <TeammateLane>{mate.lane}</TeammateLane>
                  <TeammateTier $tier={mate.tier}>{mate.tier}티어</TeammateTier>
                </TeammateNameRow>
                <TeammateKda>{mate.kda}</TeammateKda>
              </div>
            </TeammateInfo>
            <OptionRow>
              {RATING_OPTIONS.map((option) => (
                <OptionChip
                  key={option}
                  $selected={ratings[mate.id] === option}
                  onClick={() => handleSelect(mate.id, option)}
                >
                  {option}
                </OptionChip>
              ))}
            </OptionRow>
          </TeammateRow>
        ))}

        <Footer>
          <AnonymousHint>평가는 익명으로 반영돼요</AnonymousHint>
          <FooterActions>
            <Button $variant="ghost" $size="sm" onClick={() => navigate(`/scrims/${id}`)}>
              나중에
            </Button>
            <Button $size="sm" onClick={handleSubmit} disabled={submitRating.isPending || completedCount === 0}>
              평가 제출
            </Button>
          </FooterActions>
        </Footer>
      </Panel>
    </Screen>
  );
}
