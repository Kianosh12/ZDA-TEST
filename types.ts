export interface WaterAnalysis {
  flowRate: number; // m3/hr
  tds: number; // mg/L
  ph: number;
  cod: number; // mg/L
  chlorides: number; // mg/L
  sulfates: number; // mg/L
  hardness: number; // mg/L as CaCO3
  temp: number; // Celsius
}

export interface ZLDArticle {
  id: string;
  title: string;
  summary: string;
  keyTechnologies: string[];
  rawContent: string;
  dateAdded: string;
}

export interface ZLDScenario {
  id: string;
  name: string;
  description: string;
  recoveryRate: number; // Percentage
  steps: {
    name: string;
    type: 'Pretreatment' | 'Membrane' | 'Thermal' | 'SolidHandling';
    description: string;
  }[];
  capexEstimate: string; // Range or text
  opexEstimate: string; // Range or text
  energyConsumption: number; // kWh/m3
  risks: string[];
}

export interface AgentReport {
  id: string;
  timestamp: string;
  status: 'success' | 'failed';
  searchQuery: string;
  findings: string; // Markdown content
  sources: { uri: string; title: string }[];
}

export interface AgentState {
  knowledgeBase: ZLDArticle[];
  currentAnalysis: WaterAnalysis | null;
  generatedScenarios: ZLDScenario[];
  agentReports: AgentReport[];
  activeView: 'dashboard' | 'knowledge' | 'analysis' | 'report' | 'monitor';
}

export enum ProcessType {
    RO = 'RO',
    HERO = 'HERO',
    MVR = 'MVR',
    MEE = 'MEE',
    CRYSTALLIZER = 'Crystallizer',
    ATFD = 'ATFD'
}