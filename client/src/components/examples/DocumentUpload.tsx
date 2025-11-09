import DocumentUpload from '../DocumentUpload';

export default function DocumentUploadExample() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <DocumentUpload onUpload={(file) => console.log('Uploaded:', file.name)} />
    </div>
  );
}
