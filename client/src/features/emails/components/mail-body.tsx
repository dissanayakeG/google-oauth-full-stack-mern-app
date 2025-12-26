import { useParams } from 'react-router-dom';
import { useEmail } from '@/features/emails/hooks/use-email-hook';

export default function MailBody() {
  const { id = '' } = useParams();
  const { data } = useEmail({ id: id });
  const emailContent = data?.data?.body?.html;

  return (
    <div className="bg-white text-gray-900 shadow-sm border border-gray-200 p-4 h-full">
      <div dangerouslySetInnerHTML={{ __html: emailContent }} />
    </div>
  );
}
