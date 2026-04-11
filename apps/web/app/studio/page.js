import { workflowCatalog } from '@omnitoolset/shared/platform';

import { WorkflowStudio } from '../../components/workflow-studio';

export const metadata = {
  title: 'Workflow Studio | OmniToolset',
  description:
    'Run the first OmniToolset automation workflows and inspect live workflow output.'
};

export default function StudioPage() {
  return (
    <div className="page shell section">
      <WorkflowStudio workflows={workflowCatalog} />
    </div>
  );
}
