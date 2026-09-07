/**
 * SATQUERY AI — Benchmark Dataset Adapters
 * Adapters for SIH 2026 Problem Statement 26167:
 * - BigEarthNet (Multimodal Sentinel-1/2 Land Cover)
 * - VRSBench (Captioning, Grounding, VQA)
 * - RSVQA (Remote Sensing VQA)
 * - CDVQA (Bi-Temporal Change Detection VQA)
 */

import { BenchmarkDataset, BenchmarkSample } from './types';

const BENCHMARK_DATASETS: BenchmarkDataset[] = [
  {
    id: 'RSVQA',
    name: 'RSVQA (Remote Sensing Visual Question Answering)',
    targetTask: 'Visual Question Answering (Numerical & Semantic)',
    sensor: 'Sentinel-2 Multispectral & Aerial Imagery',
    modality: 'OPTICAL',
    sampleCount: 154000,
    license: 'CC BY-NC-SA 4.0',
    description: 'Pioneering remote sensing VQA benchmark evaluating presence, count, and comparison of geospatial entities across multispectral scenes.',
    source: 'RSVQA / Sylvain Lobry et al. (IEEE TGRS)',
    samples: [
      {
        id: 'RSVQA_SAMPLE_01',
        title: 'RSVQA High-Res: Commercial Aircraft & Apron Count',
        dataset: 'RSVQA',
        query: 'How many aircraft are stationed on the tarmac apron?',
        groundTruthAnswer: '4 commercial aircraft detected along the western terminal gate apron.',
        groundTruthBoxes: [
          { id: 'b1', label: 'Commercial Aircraft', confidence: 0.96, box: [0.32, 0.22, 0.44, 0.32] },
          { id: 'b2', label: 'Commercial Aircraft', confidence: 0.94, box: [0.35, 0.38, 0.47, 0.48] },
          { id: 'b3', label: 'Commercial Aircraft', confidence: 0.93, box: [0.48, 0.25, 0.60, 0.35] },
          { id: 'b4', label: 'Commercial Aircraft', confidence: 0.95, box: [0.52, 0.42, 0.64, 0.52] },
        ],
        images: [
          {
            label: 'High-Res Optical Runway',
            url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
            modality: 'OPTICAL',
            acquisitionDate: '2024-05-12T10:30:00Z',
            sensor: 'High-Resolution 0.5m Optical',
            resolution: 0.5,
          },
        ],
        notes: 'High spatial resolution test evaluating small object localization and dense cluster discrimination.',
      },
      {
        id: 'RSVQA_SAMPLE_02',
        title: 'RSVQA Low-Res: Rural Water Body Presence',
        dataset: 'RSVQA',
        query: 'Is there a permanent water reservoir visible in this agricultural sector?',
        groundTruthAnswer: 'Yes, a designated earthen irrigation tank with high NDWI (>0.45) is situated in the north-east quad.',
        images: [
          {
            label: 'Agricultural Reservoir Sector',
            url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
            modality: 'OPTICAL',
            acquisitionDate: '2024-03-20T05:40:00Z',
            sensor: 'Resourcesat-2A LISS-3',
            resolution: 23.5,
          },
        ],
        notes: 'Low-to-medium resolution optical test examining spectral water extraction and presence verification.',
      },
    ],
  },
  {
    id: 'VRSBench',
    name: 'VRSBench (Visual Remote Sensing Benchmark)',
    targetTask: 'Visual Grounding, Captioning & Fine-Grained Region VQA',
    sensor: 'Super-Resolution Optical EO',
    modality: 'OPTICAL',
    sampleCount: 29614,
    license: 'Research Open Access',
    description: 'Comprehensive benchmark evaluating joint visual grounding, dense descriptive captions, and multi-turn conversational reasoning in satellite imagery.',
    source: 'VRSBench / Wuhan & Tsinghua University Joint Lab',
    samples: [
      {
        id: 'VRSBENCH_SAMPLE_01',
        title: 'VRSBench Grounding: Industrial Oil Storage Tanks',
        dataset: 'VRSBench',
        query: 'Ground and outline all cylindrical fuel storage containers.',
        groundTruthAnswer: 'Identified 3 cylindrical liquid storage tanks in the industrial logistics sector.',
        groundTruthBoxes: [
          { id: 'v1', label: 'Fuel Storage Tank', confidence: 0.98, box: [0.18, 0.55, 0.35, 0.72] },
          { id: 'v2', label: 'Fuel Storage Tank', confidence: 0.97, box: [0.38, 0.56, 0.55, 0.73] },
          { id: 'v3', label: 'Fuel Storage Tank', confidence: 0.95, box: [0.58, 0.57, 0.75, 0.74] },
        ],
        images: [
          {
            label: 'Industrial Port Storage Facility',
            url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
            modality: 'OPTICAL',
            acquisitionDate: '2024-06-18T09:12:00Z',
            sensor: 'Cartosat-3 High-Res',
            resolution: 1.12,
          },
        ],
        notes: 'Visual grounding task requiring exact normalized bounding box prediction from text descriptor.',
      },
      {
        id: 'VRSBENCH_SAMPLE_02',
        title: 'VRSBench Captioning: Port Container Terminal',
        dataset: 'VRSBench',
        query: 'Generate an exhaustive technical caption of this scene.',
        groundTruthAnswer: 'A bustling deepwater container port featuring high-density stacked shipping containers, two gantry cranes aligned along the concrete quay, and adjacent maritime docking slips.',
        images: [
          {
            label: 'Container Port Overview',
            url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
            modality: 'OPTICAL',
            acquisitionDate: '2024-04-05T07:22:00Z',
            sensor: 'Sentinel-2 MSI',
            resolution: 10,
          },
        ],
        notes: 'Dense technical caption generation assessing vocabulary depth, spatial relations, and domain accuracy.',
      },
    ],
  },
  {
    id: 'CDVQA',
    name: 'CDVQA (Change Detection Visual Question Answering)',
    targetTask: 'Bi-Temporal Change Detection & Comparative VQA',
    sensor: 'Multi-Temporal Optical & SAR Pairs',
    modality: 'OPTICAL',
    sampleCount: 18000,
    license: 'Research Open Access',
    description: 'Bi-temporal vision-language benchmark testing the model ability to recognize, quantify, and localize physical changes between two timestamps.',
    source: 'CDVQA Research Consortium',
    samples: [
      {
        id: 'CDVQA_SAMPLE_01',
        title: 'CDVQA: Brahmaputra Riverbank Flood Inundation Change',
        dataset: 'CDVQA',
        query: 'Compare these two timestamps and quantify the change in surface water inundation.',
        groundTruthAnswer: 'Bi-temporal comparison indicates a +78.4% expansion of surface water body area, inundating 1,840 hectares of previously uncultivated riparian grassland.',
        groundTruthChangePercent: 78.4,
        images: [
          {
            label: 'Before (Dry Season Baseline: 2024-03-10)',
            url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
            modality: 'OPTICAL',
            acquisitionDate: '2024-03-10T04:30:00Z',
            sensor: 'Resourcesat-2A AWiFS',
            resolution: 56,
          },
          {
            label: 'After (Peak Monsoon Flood: 2024-07-22)',
            url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
            modality: 'OPTICAL',
            acquisitionDate: '2024-07-22T04:30:00Z',
            sensor: 'Resourcesat-2A AWiFS',
            resolution: 56,
          },
        ],
        notes: 'Bi-temporal hydro-meteorological flood change test evaluating spectral NDWI differential accuracy.',
      },
      {
        id: 'CDVQA_SAMPLE_02',
        title: 'CDVQA: Urban Construction & Built-Up Growth (Hyderabad)',
        dataset: 'CDVQA',
        query: 'What infrastructural changes have occurred between 2023 and 2024?',
        groundTruthAnswer: 'Detected 4 new multi-story structural foundations and 48.6 hectares of new impervious surface expansion replacing open scrubland.',
        groundTruthChangePercent: 24.1,
        images: [
          {
            label: 'Pre-Construction Baseline (2023-08-15)',
            url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
            modality: 'OPTICAL',
            acquisitionDate: '2023-08-15T05:15:00Z',
            sensor: 'Cartosat-3 1.12m',
            resolution: 1.12,
          },
          {
            label: 'Active Development Phase (2024-09-10)',
            url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
            modality: 'OPTICAL',
            acquisitionDate: '2024-09-10T05:15:00Z',
            sensor: 'Cartosat-3 1.12m',
            resolution: 1.12,
          },
        ],
        notes: 'High-resolution urban infill and building change detection benchmark test.',
      },
    ],
  },
  {
    id: 'BigEarthNet',
    name: 'BigEarthNet (Multimodal Sentinel-1/2 Archive)',
    targetTask: 'Multimodal Land-Use Land-Cover Classification & Retrieval',
    sensor: 'Sentinel-1 (SAR) & Sentinel-2 (MSI)',
    modality: 'FUSED',
    sampleCount: 590326,
    license: 'Community Data License Agreement (CDLA-Permissive-1.0)',
    description: 'Largest multimodal Earth observation dataset with 590K image patches pairing 12-band Sentinel-2 optical radiances with dual-pol Sentinel-1 SAR backscatter.',
    source: 'BigEarthNet / DLR & TU Berlin / Begüm Demir et al.',
    samples: [
      {
        id: 'BIGEARTHNET_SAMPLE_01',
        title: 'Multimodal Agro-Forestry with Cloud Masking',
        dataset: 'BigEarthNet',
        query: 'Evaluate optical vs SAR agreement across agro-forestry parcels under cloudy skies.',
        groundTruthAnswer: 'Optical bands exhibit 64% cirrus cloud attenuation; C-band SAR backscatter reveals undisturbed underlying crop rows with mean VV of -11.2 dB.',
        images: [
          {
            label: 'Sentinel-2 Optical (Cloud-Affected)',
            url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
            modality: 'OPTICAL',
            acquisitionDate: '2024-08-14T10:10:00Z',
            sensor: 'Sentinel-2 MSI',
            resolution: 10,
          },
          {
            label: 'Sentinel-1 SAR C-band (Penetrating Backscatter)',
            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
            modality: 'SAR',
            acquisitionDate: '2024-08-14T18:02:00Z',
            sensor: 'Sentinel-1 C-SAR',
            resolution: 10,
          },
        ],
        notes: 'Multimodal fusion benchmark illustrating optical cloud failure and SAR radar backscatter recovery.',
      },
    ],
  },
];

export function getBenchmarkDatasets(): BenchmarkDataset[] {
  return BENCHMARK_DATASETS;
}

export function getBenchmarkDatasetById(id: string): BenchmarkDataset | undefined {
  return BENCHMARK_DATASETS.find((d) => d.id === id);
}

export function getBenchmarkSampleById(id: string): BenchmarkSample | undefined {
  for (const ds of BENCHMARK_DATASETS) {
    const s = ds.samples.find((sample) => sample.id === id);
    if (s) return s;
  }
  return undefined;
}
