import Header from '../Header';

export default function HeaderExample() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Landing Page Header</h3>
        <Header variant="landing" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Dashboard Header</h3>
        <Header variant="dashboard" onMenuClick={() => console.log('Menu clicked')} />
      </div>
    </div>
  );
}
