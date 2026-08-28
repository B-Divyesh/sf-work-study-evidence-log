export interface ApplicationNote {
  id: string;
  usedOn: string;
  note: string;
  createdAt: string;
}

export interface PracticeEntry {
  id: string;
  practicedOn: string;
  topic: string;
  minutes: number;
  source: string;
  retrievalPrompt: string;
  openQuestion: string;
  applications: ApplicationNote[];
  createdAt: string;
  updatedAt: string;
}

export interface ExportBundle {
  product: 'work-study-evidence-log';
  version: 1;
  exportedAt: string;
  entries: PracticeEntry[];
}
