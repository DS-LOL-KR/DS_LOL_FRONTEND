import { useParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';

export function ScrimCreatePage() {
  const { id } = useParams();

  return (
    <PageLayout>
      <h1>Create Scrim ({id})</h1>
    </PageLayout>
  );
}
