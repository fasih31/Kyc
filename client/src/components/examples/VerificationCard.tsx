import VerificationCard from '../VerificationCard';

export default function VerificationCardExample() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <VerificationCard
        id="VER-2024-001"
        userName="Sarah Johnson"
        documentType="Passport"
        status="verified"
        riskScore={92}
        timestamp={new Date(Date.now() - 1000 * 60 * 30)}
        onView={() => console.log('View verification VER-2024-001')}
      />
      <VerificationCard
        id="VER-2024-002"
        userName="Michael Chen"
        documentType="Driver's License"
        status="pending"
        riskScore={85}
        timestamp={new Date(Date.now() - 1000 * 60 * 15)}
        onView={() => console.log('View verification VER-2024-002')}
      />
      <VerificationCard
        id="VER-2024-003"
        userName="Emma Wilson"
        documentType="National ID"
        status="review"
        riskScore={67}
        timestamp={new Date(Date.now() - 1000 * 60 * 45)}
        onView={() => console.log('View verification VER-2024-003')}
      />
      <VerificationCard
        id="VER-2024-004"
        userName="James Rodriguez"
        documentType="Passport"
        status="rejected"
        riskScore={32}
        timestamp={new Date(Date.now() - 1000 * 60 * 60)}
        onView={() => console.log('View verification VER-2024-004')}
      />
    </div>
  );
}
