import type { NextApiRequest, NextApiResponse } from 'next';
import { scripts } from '../../lib/scriptsConfig';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method === 'PUT') {
    const idx = scripts.findIndex(s => s.id === id);
    if (idx >= 0) {
      scripts[idx] = req.body;
      res.status(200).json(scripts[idx]);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
