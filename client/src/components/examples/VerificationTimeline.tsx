import VerificationTimeline from '../VerificationTimeline';

const mockSteps = [
  {
    title: 'Document Uploaded',
    description: 'Passport uploaded successfully',
    status: 'completed' as const,
    timestamp: '2 minutes ago'
  },
  {
    title: 'AI Verification',
    description: 'OCR extraction and document validation',
    status: 'completed' as const,
    timestamp: '1 minute ago'
  },
  {
    title: 'Biometric Match',
    description: 'Face matching in progress',
    status: 'current' as const
  },
  {
    title: 'Risk Assessment',
    description: 'Pending completion of biometric verification',
    status: 'pending' as const
  },
  {
    title: 'Final Decision',
    description: 'Awaiting manual review',
    status: 'pending' as const
  }
];

export default function VerificationTimelineExample() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <VerificationTimeline steps={mockSteps} />
    </div>
  );
}
