import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function UserList() {
  const { data, error } = useSWR('/api/users', fetcher);

  if (error) return <div>Error loading users.</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User List</h1>
      <ul className="space-y-2">
        {data.map((user: any) => (
          <li key={user.id} className="border p-2 rounded">
            {user.username} - {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
}