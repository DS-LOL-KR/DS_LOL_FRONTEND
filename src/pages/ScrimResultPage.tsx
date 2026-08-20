import { useParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';

export function ScrimResultPage() {
  const { id } = useParams();

  return (
    <PageLayout>
      <h1>Scrim Result ({id})</h1>
    </PageLayout>
  );
}
