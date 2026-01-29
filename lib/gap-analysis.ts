import { prisma } from './prisma';

export interface GapAnalysisResult {
  proteinId: string;
  proteinName: string;
  requirements: {
    process: { required: number; has: number };
    evidence: { required: number; has: number };
    documents: { required: number; has: number };
  };
  gaps: {
    process: 'complete' | 'partial' | 'missing';
    evidence: 'complete' | 'partial' | 'missing';
    documents: 'complete' | 'partial' | 'missing';
  };
  status: 'READY_FOR_IP' | 'IN_PROGRESS' | 'NOT_STARTED';
  recommendations: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
    missing: number;
  }>;
}

export async function analyzeProteinGaps(proteinId: string): Promise<GapAnalysisResult> {
  const protein = await prisma.protein.findUnique({
    where: { id: proteinId },
    include: {
      processes: true,
      evidence: true,
      documents: true
    }
  });

  if (!protein) {
    throw new Error('Protein not found');
  }

  const requirements = {
    process: { required: 1, has: protein.processes.length },
    evidence: { required: 3, has: protein.evidence.length },
    documents: { required: 5, has: protein.documents.length }
  };

  const gaps = {
    process: requirements.process.has >= requirements.process.required ? 'complete' : 
             requirements.process.has > 0 ? 'partial' : 'missing',
    evidence: requirements.evidence.has >= requirements.evidence.required ? 'complete' : 
              requirements.evidence.has > 0 ? 'partial' : 'missing',
    documents: requirements.documents.has >= requirements.documents.required ? 'complete' : 
               requirements.documents.has > 0 ? 'partial' : 'missing'
  } as const;

  const allComplete = Object.values(gaps).every(g => g === 'complete');
  const someProgress = Object.values(gaps).some(g => g !== 'missing');
  
  const status = allComplete ? 'READY_FOR_IP' : someProgress ? 'IN_PROGRESS' : 'NOT_STARTED';

  const recommendations: GapAnalysisResult['recommendations'] = [];

  if (gaps.process !== 'complete') {
    recommendations.push({
      priority: 'HIGH',
      message: 'Add production process data',
      missing: requirements.process.required - requirements.process.has
    });
  }

  if (gaps.evidence !== 'complete') {
    recommendations.push({
      priority: 'HIGH',
      message: `Add ${requirements.evidence.required - requirements.evidence.has} more evidence items`,
      missing: requirements.evidence.required - requirements.evidence.has
    });
  }

  if (gaps.documents !== 'complete') {
    recommendations.push({
      priority: 'MEDIUM',
      message: `Upload ${requirements.documents.required - requirements.documents.has} more supporting documents`,
      missing: requirements.documents.required - requirements.documents.has
    });
  }

  return {
    proteinId,
    proteinName: protein.name,
    requirements,
    gaps,
    status,
    recommendations
  };
}

export async function analyzeAllProteins(): Promise<GapAnalysisResult[]> {
  const proteins = await prisma.protein.findMany();
  return Promise.all(proteins.map(p => analyzeProteinGaps(p.id)));
}
