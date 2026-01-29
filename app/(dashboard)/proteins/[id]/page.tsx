import { prisma } from '@/lib/prisma';
import { analyzeProteinGaps } from '@/lib/gap-analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';

async function getProtein(id: string) {
  const protein = await prisma.protein.findUnique({
    where: { id },
    include: {
      processes: {
        include: {
          process: true
        }
      },
      evidence: true,
      documents: true
    }
  });

  if (!protein) return null;

  const gaps = await analyzeProteinGaps(id);
  return { ...protein, gaps };
}

export default async function ProteinDetailPage({
  params
}: {
  params: { id: string }
}) {
  const protein = await getProtein(params.id);

  if (!protein) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{protein.name}</h1>
        {protein.sequence && (
          <p className="text-xs text-gray-500 mt-2 font-mono">
            {protein.sequence.substring(0, 100)}...
          </p>
        )}
      </div>

      {/* Gap Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gap Analysis</CardTitle>
            <Badge
              className={
                protein.gaps.status === 'READY_FOR_IP'
                  ? 'bg-green-500'
                  : protein.gaps.status === 'IN_PROGRESS'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }
            >
              {protein.gaps.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <GapItem
              label="Process Data"
              status={protein.gaps.gaps.process}
              has={protein.gaps.requirements.process.has}
              required={protein.gaps.requirements.process.required}
            />
            <GapItem
              label="Evidence"
              status={protein.gaps.gaps.evidence}
              has={protein.gaps.requirements.evidence.has}
              required={protein.gaps.requirements.evidence.required}
            />
            <GapItem
              label="Documents"
              status={protein.gaps.gaps.documents}
              has={protein.gaps.requirements.documents.has}
              required={protein.gaps.requirements.documents.required}
            />
          </div>

          {protein.gaps.recommendations.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 text-sm">Recommendations:</h3>
              <div className="space-y-2">
                {protein.gaps.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-md text-sm ${
                      rec.priority === 'HIGH'
                        ? 'bg-red-50 border border-red-200'
                        : rec.priority === 'MEDIUM'
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <span className="font-semibold">{rec.priority}:</span> {rec.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processes */}
      <Card>
        <CardHeader>
          <CardTitle>Production Processes</CardTitle>
        </CardHeader>
        <CardContent>
          {protein.processes.length === 0 ? (
            <p className="text-gray-500 text-sm">No processes linked yet</p>
          ) : (
            <div className="space-y-2">
              {protein.processes.map((pp) => (
                <div key={pp.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">{pp.process.name}</p>
                    <p className="text-xs text-gray-500">{pp.process.type}</p>
                  </div>
                  {pp.yield && (
                    <Badge variant="outline" className="font-semibold">
                      {pp.yield}% yield
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence */}
      <Card>
        <CardHeader>
          <CardTitle>Evidence</CardTitle>
        </CardHeader>
        <CardContent>
          {protein.evidence.length === 0 ? (
            <p className="text-gray-500 text-sm">No evidence yet</p>
          ) : (
            <div className="space-y-3">
              {protein.evidence.map((ev) => (
                <div key={ev.id} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm">{ev.type}</p>
                    {ev.confidence && (
                      <Badge variant="outline">{ev.confidence}% confidence</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{ev.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Related Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {protein.documents.length === 0 ? (
            <p className="text-gray-500 text-sm">No documents linked yet</p>
          ) : (
            <div className="space-y-2">
              {protein.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <span className="text-xl">📄</span>
                  <span className="text-sm">{doc.filename}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GapItem({
  label,
  status,
  has,
  required
}: {
  label: string;
  status: 'complete' | 'partial' | 'missing';
  has: number;
  required: number;
}) {
  return (
    <div className="p-4 border rounded-lg">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">
          {has}/{required}
        </span>
        <div className="text-2xl">
          {status === 'complete' && '✅'}
          {status === 'partial' && '⚠️'}
          {status === 'missing' && '❌'}
        </div>
      </div>
    </div>
  );
}
