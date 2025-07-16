import type { NextApiRequest, NextApiResponse } from 'next';

export const scripts = [
  { id: 'unzip', name: 'Unzip File', input: 'ZIP', output: 'Folder', enabled: true, params: '--deep' },
  { id: 'csv_to_json', name: 'CSV to JSON', input: 'CSV', output: 'JSON', enabled: false, params: '--columns=name,age' }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(scripts);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
