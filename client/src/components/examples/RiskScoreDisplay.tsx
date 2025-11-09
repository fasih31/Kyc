import RiskScoreDisplay from '../RiskScoreDisplay';

export default function RiskScoreDisplayExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-sm font-medium text-muted-foreground">Low Risk</h3>
        <RiskScoreDisplay score={92} size="md" />
      </div>
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-sm font-medium text-muted-foreground">Medium Risk</h3>
        <RiskScoreDisplay score={65} size="md" />
      </div>
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-sm font-medium text-muted-foreground">Critical Risk</h3>
        <RiskScoreDisplay score={28} size="md" />
      </div>
    </div>
  );
}
