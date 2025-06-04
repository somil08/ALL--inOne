import { client } from '@repo/db/client';

export default async function UsersPage() {
  const users = await client.user.findMany();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="border p-2">
            <strong>{user.username}</strong> - {user.password}
          </li>
        ))}
      </ul>
    </div>
  );
}
