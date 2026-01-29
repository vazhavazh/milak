import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { analyzeProteinGaps } from '@/lib/gap-analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

async function getProteinsWithGaps() {
  const proteins = await prisma.protein.findMany({
    include: {
      processes: true,
      evidence: true,
      documents: true
    }
  });

  const proteinsWithGaps = await Promise.all(
    proteins.map(async (protein) => {
      const gaps = await analyzeProteinGaps(protein.id);
      return { ...protein, gaps };
    })
  );

  return proteinsWithGaps;
}

export default async function ProteinsPage() {
  const proteins = await getProteinsWithGaps();

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Proteins</h1>
        <p className="text-gray-600 mt-2">
          Overview of all proteins and their readiness status
        </p>
      </div>

      <div className="grid gap-6">
        {proteins.map((protein) => (
          <Link key={protein.id} href={`/proteins/${protein.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{protein.name}</CardTitle>
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
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Processes</p>
                    <p className="font-semibold">
                      {protein.processes.length} linked
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Evidence</p>
                    <p className="font-semibold">
                      {protein.evidence.length} items
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Documents</p>
                    <p className="font-semibold">
                      {protein.documents.length} files
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
