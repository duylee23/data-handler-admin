import type { NextApiRequest, NextApiResponse } from 'next';

const users = [
  { id: 1, username: 'admin', role: 'ADMIN' },
  { id: 2, username: 'user1', role: 'USER' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(users);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}