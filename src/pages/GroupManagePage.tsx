import { useParams } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';

export function GroupManagePage() {
  const { id } = useParams();

  return (
    <PageLayout>
      <h1>Group Manage ({id})</h1>
    </PageLayout>
  );
}
