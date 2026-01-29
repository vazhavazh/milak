import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'admin@milak.com',
      password: hashedPassword,
      name: 'Admin User'
    }
  });
  console.log('✅ Created user:', user.email);

  // 2. Create processes
  const processes = await Promise.all([
    prisma.process.create({
      data: {
        name: 'Fermentation at 30°C',
        description: 'Standard fermentation process at 30°C, pH 7.2',
        type: 'Fermentation'
      }
    }),
    prisma.process.create({
      data: {
        name: 'Fermentation at 37°C',
        description: 'High-temperature fermentation at 37°C',
        type: 'Fermentation'
      }
    }),
    prisma.process.create({
      data: {
        name: 'Purification - Column A',
        description: 'Chromatography purification process',
        type: 'Purification'
      }
    })
  ]);
  console.log('✅ Created', processes.length, 'processes');

  // 3. Create proteins
  const proteinX = await prisma.protein.create({
    data: {
      name: 'Protein X',
      sequence: 'MKVLWAALLVTFLAGCQAKVEQAVETEPEPELRQQTEWQSGQRWELALGRFWDYLRWVQTLSEQVQEELLSSQVTQELRALMDETMKELKAYKSELEEQLTPVAEETRARLSKELQAAQARLGADMEDVCGRLVQYRGEVQAMLGQSTEELRVRLASHLRKLRKRLLRDADDLQKRLAVYQAGAREGAERGLSAIRERLGPLVEQGRVRAATVGSLAGQPLQERAQAWGERLRARMEEMGSRTRDRLDEVKEQVAEVRAKLEEQAQQIRLQAEAFQARLKSWFEPLVEDMQRQWAGLVEKVQAAVGTSAAPVPSDNH',
      maturity: 'MVP'
    }
  });

  const proteinY = await prisma.protein.create({
    data: {
      name: 'Protein Y',
      sequence: 'MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQAPILSRVGDGTQDNLSGAEKAVQVKVKALPDAQFEVVHSLAKWKRQTLGQHDFSAGEGLYTHMKALRPDEDRLSPLHSVYVDQWDWERVMGDGERQFSTLKSTVEAIWAGIKATEAAVSEEFGLAPFLPDQIHFVHSQELLSRYPDLDAKGRERAIAKDLGAVFLVGIGGKLSDGHRHDVRAPDYDDWSTPSELGHAGLNGDILVWNPVLEDAFELSSMGIRVDADTLKHQLALTGDEDRLELEWHQALLRGEMPQTIGGGIGQSRLTMLLLQLPHIGQVQAGVWPAAVRESVPSLL',
      maturity: 'R&D'
    }
  });

  const proteinZ = await prisma.protein.create({
    data: {
      name: 'Protein Z',
      maturity: 'Production'
    }
  });
  console.log('✅ Created 3 proteins');

  // 4. Link proteins to processes
  await prisma.proteinProcess.create({
    data: {
      proteinId: proteinX.id,
      processId: processes[0].id,
      yield: 85.0,
      conditions: JSON.stringify({ temp: 30, pH: 7.2, duration: 48 })
    }
  });

  await prisma.proteinProcess.create({
    data: {
      proteinId: proteinX.id,
      processId: processes[2].id,
      yield: 92.0
    }
  });

  await prisma.proteinProcess.create({
    data: {
      proteinId: proteinY.id,
      processId: processes[1].id,
      yield: 78.0
    }
  });

  await prisma.proteinProcess.create({
    data: {
      proteinId: proteinZ.id,
      processId: processes[0].id,
      yield: 90.0
    }
  });
  console.log('✅ Created protein-process links');

  // 5. Create evidence
  await Promise.all([
    prisma.evidence.create({
      data: {
        type: 'Mass Spectrometry',
        description: 'MS analysis showed 94% purity with expected molecular weight of 42 kDa',
        confidence: 95,
        proteinId: proteinX.id
      }
    }),
    prisma.evidence.create({
      data: {
        type: 'Fermentation Yield',
        description: 'Achieved 85% yield in 48-hour fermentation at 30°C',
        confidence: 90,
        proteinId: proteinX.id
      }
    }),
    prisma.evidence.create({
      data: {
        type: 'Stability Test',
        description: '6-month stability test at 4°C showed <5% degradation',
        confidence: 88,
        proteinId: proteinX.id
      }
    }),
    prisma.evidence.create({
      data: {
        type: 'Mass Spectrometry',
        description: 'Purity 89%, molecular weight confirmed',
        confidence: 92,
        proteinId: proteinY.id
      }
    }),
    prisma.evidence.create({
      data: {
        type: 'Process Validation',
        description: 'Three consecutive batches with >85% yield',
        confidence: 95,
        proteinId: proteinZ.id
      }
    }),
    prisma.evidence.create({
      data: {
        type: 'Quality Control',
        description: 'Passed all QC tests including endotoxin levels',
        confidence: 98,
        proteinId: proteinZ.id
      }
    })
  ]);
  console.log('✅ Created evidence items');

  // 6. Create test documents
  await Promise.all([
    prisma.document.create({
      data: {
        filename: 'Protein_X_Fermentation_Study.pdf',
        content: `PROTEIN X FERMENTATION STUDY - Executive Summary

Introduction:
This study evaluates the fermentation process for Protein X production using precision fermentation methodology. The objective was to optimize yield and purity while maintaining cost efficiency.

Methods:
- Fermentation conducted at 30°C in 50L bioreactor
- pH maintained at 7.2 throughout process
- Duration: 48 hours with continuous monitoring
- Strain: Modified E. coli BL21(DE3)

Results:
- Final yield: 85% of theoretical maximum
- Protein concentration: 2.3 g/L
- Purity after initial harvest: 78%
- Post-purification purity: 94%

Mass Spectrometry Analysis:
MS confirmed expected molecular weight of 42 kDa with high accuracy. Purity analysis showed 94% target protein with minimal contaminants.

Stability:
6-month stability testing at 4°C demonstrated <5% degradation, indicating excellent shelf life potential.

Conclusion:
The fermentation process demonstrates excellent reproducibility and scalability potential. Yield of 85% exceeds industry standards for similar proteins. Recommend progression to pilot scale.`,
        mimeType: 'application/pdf',
        fileSize: 2340000,
        proteinId: proteinX.id
      }
    }),
    prisma.document.create({
      data: {
        filename: 'Mass_Spec_Analysis_Results.pdf',
        content: `MASS SPECTROMETRY ANALYSIS - PROTEIN X

Sample ID: PX-2024-001
Analysis Date: January 15, 2024
Analyst: Dr. Sarah Chen

Equipment:
- Waters Xevo G2-XS QTof
- Acquity UPLC I-Class

Sample Preparation:
Protein sample diluted to 1 mg/mL in ammonium acetate buffer (pH 7.4)

Results:
Molecular Weight (Expected): 42,150 Da
Molecular Weight (Observed): 42,148 Da
Deviation: 0.005%

Purity Analysis:
Main Peak (Target Protein): 94.2%
Impurities:
  - Peak 1 (Host cell proteins): 3.1%
  - Peak 2 (Aggregates): 1.8%
  - Peak 3 (Fragments): 0.9%

Post-Translational Modifications:
No unexpected PTMs detected. All modifications consistent with expression system.

Conclusion:
Sample demonstrates excellent purity (94.2%) suitable for therapeutic applications. Molecular weight confirms correct protein sequence. Recommend approval for next phase testing.`,
        mimeType: 'application/pdf',
        fileSize: 1850000,
        proteinId: proteinX.id
      }
    }),
    prisma.document.create({
      data: {
        filename: 'Stability_Test_Report.docx',
        content: `STABILITY TESTING REPORT
Protein X - 6 Month Study

Study Overview:
Long-term stability assessment of Protein X under various storage conditions to establish shelf-life and storage recommendations.

Storage Conditions Tested:
1. 4°C (refrigerated)
2. -20°C (frozen)
3. -80°C (deep frozen)
4. 25°C (room temperature - accelerated)

Methodology:
- Testing intervals: 0, 1, 3, 6 months
- Parameters measured: Purity, activity, aggregation
- Analytical methods: SEC-HPLC, SDS-PAGE, activity assay

Results Summary:

4°C Storage (Recommended):
Month 0: 94.2% purity, 100% activity
Month 1: 93.8% purity, 98% activity
Month 3: 93.1% purity, 96% activity
Month 6: 89.5% purity, 93% activity
Degradation rate: <5% over 6 months ✓

-20°C Storage:
Excellent stability maintained. <2% degradation over 6 months.

-80°C Storage:
No measurable degradation. Ideal for long-term storage.

25°C Storage (Accelerated):
Significant degradation observed after 1 month. Not recommended.

Conclusions:
1. Protein X demonstrates excellent stability at 4°C
2. Shelf life of at least 6 months at refrigerated conditions
3. Suitable for therapeutic development
4. Recommend storage at -20°C for inventory management

Recommendations for IP Filing:
This stability data strongly supports commercial viability and should be included in patent application as evidence of product durability and practical utility.`,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileSize: 456000,
        proteinId: proteinX.id
      }
    }),
    prisma.document.create({
      data: {
        filename: 'Protein_Y_Preliminary_Results.pdf',
        content: `PROTEIN Y - PRELIMINARY FEASIBILITY STUDY

Project Status: Research & Development Phase

Background:
Protein Y represents a novel functional protein with potential applications in food technology. Initial studies focus on expression optimization and basic characterization.

Expression System:
- Host: Pichia pastoris
- Fermentation temperature: 37°C
- Induction: Methanol-based

Preliminary Results:
- Expression confirmed by Western blot
- Estimated yield: 78% (requires optimization)
- Purity: 89% after basic purification

Mass Spectrometry:
Molecular weight confirmed at expected value. Purity analysis shows 89% target protein.

Next Steps:
1. Optimize fermentation conditions
2. Improve purification protocol
3. Conduct functional testing
4. Stability assessment required

Current Gaps:
- No long-term stability data
- Limited batch-to-batch reproducibility data
- Cost analysis pending
- Regulatory pathway not yet defined

Status: NOT READY for IP filing. Additional development required.`,
        mimeType: 'application/pdf',
        fileSize: 980000,
        proteinId: proteinY.id
      }
    }),
    prisma.document.create({
      data: {
        filename: 'Protein_Z_Production_Validation.pdf',
        content: `PROTEIN Z - PRODUCTION VALIDATION REPORT

Status: PRODUCTION READY

Validation Summary:
Three consecutive production batches demonstrate consistent quality and yield, meeting all acceptance criteria for commercial production.

Batch Data:
Batch PZ-001: 90.2% yield, 97.8% purity
Batch PZ-002: 89.8% yield, 98.1% purity  
Batch PZ-003: 91.1% yield, 97.5% purity

Average: 90.4% yield, 97.8% purity
Variation: <2% (well within specifications)

Quality Control:
- Endotoxin levels: <0.5 EU/mg (Pass)
- Bioburden: <10 CFU/g (Pass)
- Heavy metals: Below detection limits (Pass)
- Residual host proteins: <1% (Pass)

Process Validation:
All critical process parameters (CPPs) within validated ranges across all three batches. Process demonstrated robustness and reproducibility.

Regulatory Status:
- EFSA Novel Food application submitted
- FDA GRAS notification in preparation
- Manufacturing facility GMP certified

Commercial Readiness:
✓ Process validated
✓ Quality systems in place
✓ Regulatory pathway clear
✓ Cost structure competitive
✓ Scale-up validated to 1000L

Recommendation:
Protein Z is READY for commercial launch. All technical and regulatory requirements satisfied.`,
        mimeType: 'application/pdf',
        fileSize: 1200000,
        proteinId: proteinZ.id
      }
    })
  ]);
  console.log('✅ Created 5 documents with realistic content');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Test credentials:');
  console.log('   Email: admin@milak.com');
  console.log('   Password: password123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
