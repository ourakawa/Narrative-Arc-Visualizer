export interface NarrativeBeat {
  beat_number: number;
  title: string;
  summary: string;
  act: 'Act 1' | 'Act 2' | 'Act 3';
  emotional_value: number; // -10 to 10
  tension_level: number; // 0 to 10
  analysis_comment: string;
}

export interface StructuralAlert {
  type: 'warning' | 'info' | 'success';
  message: string;
}

export interface AnalysisResponse {
  title: string;
  logline: string;
  overall_structure: string;
  structural_defect_feedback: string[]; // List of QC feedback points
  beats: NarrativeBeat[];
}

export interface AnalysisState {
  isLoading: boolean;
  result: AnalysisResponse | null;
  error: string | null;
}
