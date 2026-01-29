import { prisma } from '@/lib/prisma';
import { UploadForm } from './upload-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function getDocuments() {
  return await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      protein: {
        select: {
          name: true
        }
      }
    }
  });
}

export default async function DocumentsPage() {
  const documents = await getDocuments();

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Documents</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload New Document</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No documents yet. Upload your first document above!
            </p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📄</div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.filename}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString()} •{' '}
                        {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : 'N/A'}
                        {doc.protein && ` • Linked to ${doc.protein.name}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
