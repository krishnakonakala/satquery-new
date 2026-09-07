/**
 * SATQUERY AI — Query Planner Engine
 * Natural language intent parsing, task decomposition, and spatio-temporal entity extraction
 * Smart India Hackathon 2026 — PS 26167
 */

import { TaskType, ModalityType } from './types';
import { geocodeLocationWithBhuvan } from './bhuvanService';

export interface AnalysisPlan {
  task: TaskType;
  subtask?: string;
  target?: string;
  requiredModalities: ModalityType[];
  imageCountRequired: number;
  extractedLocation?: string;
  geoCoordinates?: { lat: number; lng: number };
  extractedTimeframe?: string;
  confidence: number;
  rationale: string;
}

export async function createAnalysisPlan(
  query: string,
  availableImageCount: number,
  inputModalities?: ModalityType[]
): Promise<AnalysisPlan> {
  const q = query.toLowerCase();

  // 1. Spatio-temporal extraction
  const geocoded = await geocodeLocationWithBhuvan(query);
  const extractedLocation = geocoded?.placeName;
  const geoCoordinates = geocoded ? { lat: geocoded.lat, lng: geocoded.lng } : undefined;

  let extractedTimeframe: string | undefined;
  if (q.includes('2024') || q.includes('2023') || q.includes('2026')) {
    const yearMatch = q.match(/\b(202[0-6])\b/g);
    extractedTimeframe = yearMatch ? yearMatch.join(' to ') : 'Historical Archive';
  } else if (q.includes('recent') || q.includes('today') || q.includes('latest')) {
    extractedTimeframe = 'Near-Real-Time (NRT) / Latest Observation';
  }

  // 2. Task classification hierarchy (Section 139)
  let task: TaskType = 'single_image_vqa';
  let target = 'General Earth Observation Feature';
  let subtask = 'semantic_vqa';
  let requiredModalities: ModalityType[] = ['OPTICAL'];
  let imageCountRequired = 1;
  let rationale = '';

  const hasMultipleImages = availableImageCount >= 2;

  if (q.includes('fusion') || q.includes('optical and sar') || (inputModalities?.includes('OPTICAL') && inputModalities?.includes('SAR'))) {
    task = 'optical_sar_fusion';
    subtask = 'cross_modal_synthesis';
    target = 'Dual-Domain Verification';
    requiredModalities = ['OPTICAL', 'SAR'];
    imageCountRequired = 2;
    rationale = 'Query requests simultaneous multi-sensor integration of optical reflectance and radar backscatter.';
  } else if (hasMultipleImages || q.includes('change') || q.includes('compare') || q.includes('difference') || q.includes('before and after') || q.includes('increased') || q.includes('decreased')) {
    task = 'bi_temporal_change';
    subtask = q.includes('water') || q.includes('flood') ? 'water_expansion_change' : q.includes('build') || q.includes('urban') ? 'builtup_infrastructure_change' : 'landcover_change';
    target = q.includes('water') ? 'Surface Water Inundation' : q.includes('build') ? 'Urban Infrastructure Footprints' : 'Land Cover Dynamics';
    requiredModalities = ['OPTICAL'];
    imageCountRequired = 2;
    rationale = 'Query involves comparative temporal assessment between two observation epochs.';
  } else if (q.includes('where') || q.includes('ground') || q.includes('locate') || q.includes('box') || q.includes('find all') || q.includes('detect')) {
    task = 'grounding';
    subtask = 'visual_grounding_bbox';
    target = q.includes('water') ? 'Water Bodies' : q.includes('plane') || q.includes('aircraft') ? 'Commercial Aircraft' : q.includes('tank') ? 'Storage Tanks' : q.includes('building') ? 'Buildings' : 'Target Entities';
    requiredModalities = ['OPTICAL'];
    imageCountRequired = 1;
    rationale = 'Query asks for precise visual bounding box localization of specific geospatial objects.';
  } else if (q.includes('sar') || q.includes('radar') || q.includes('backscatter') || q.includes('polarization') || q.includes('eos-04') || q.includes('risat')) {
    task = 'sar_analysis';
    subtask = 'polarimetric_backscatter_evaluation';
    target = 'Radar Dielectric Roughness & Backscatter';
    requiredModalities = ['SAR'];
    imageCountRequired = 1;
    rationale = 'Query explicitly focuses on microwave SAR characteristics, polarimetry, or speckle.';
  } else if (q.includes('describe') || q.includes('caption') || q.includes('overview') || q.includes('what is happening')) {
    task = 'caption';
    subtask = 'dense_remote_sensing_caption';
    target = 'Exhaustive Scene Description';
    requiredModalities = ['OPTICAL'];
    imageCountRequired = 1;
    rationale = 'Query requests an exhaustive dense description of the remote sensing scene.';
  } else if (q.includes('ndvi') || q.includes('vegetation') || q.includes('crop') || q.includes('forest') || q.includes('ndwi') || q.includes('spectral')) {
    task = 'optical_analysis';
    subtask = 'multispectral_index_evaluation';
    target = 'Vegetation & Spectral Biophysical Indices';
    requiredModalities = ['MULTISPECTRAL'];
    imageCountRequired = 1;
    rationale = 'Query targets biophysical reflectance indices (NDVI/NDWI/NDBI).';
  } else {
    task = 'single_image_vqa';
    subtask = 'visual_question_answering';
    target = 'Scientific Scene Attributes';
    requiredModalities = ['OPTICAL'];
    imageCountRequired = 1;
    rationale = 'Standard remote sensing VQA query addressing semantic scene properties.';
  }

  return {
    task,
    subtask,
    target,
    requiredModalities,
    imageCountRequired,
    extractedLocation,
    geoCoordinates,
    extractedTimeframe,
    confidence: 0.96,
    rationale,
  };
}
