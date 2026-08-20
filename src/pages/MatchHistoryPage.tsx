import { useParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';

export function MatchHistoryPage() {
  const { id } = useParams();

  return (
    <PageLayout>
      <h1>Match History ({id})</h1>
    </PageLayout>
  );
}
