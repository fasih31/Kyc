import SelfieCapture from '../SelfieCapture';

export default function SelfieCaptureExample() {
  return (
    <div className="p-6">
      <SelfieCapture onCapture={(data) => console.log('Captured:', data)} />
    </div>
  );
}
