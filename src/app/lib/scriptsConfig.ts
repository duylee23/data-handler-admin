export interface ScriptConfig {
  id: string;
  name: string;
  input: string;
  output: string;
  enabled: boolean;
  params: string;
}

export const scripts: ScriptConfig[] = [
  { id: 'unzip', name: 'Unzip File', input: 'ZIP', output: 'Folder', enabled: true, params: '--deep' },
  { id: 'csv_to_json', name: 'CSV to JSON', input: 'CSV', output: 'JSON', enabled: false, params: '--columns=name,age' }
];