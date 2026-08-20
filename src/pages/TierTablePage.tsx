import { useParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';

export function TierTablePage() {
  const { id } = useParams();

  return (
    <PageLayout>
      <h1>Tier Table ({id})</h1>
    </PageLayout>
  );
}
