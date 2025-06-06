'use client';

import { useEffect, useState } from 'react';

type User = {
  id: number;
  username: string;
  password: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    }
    fetchUsers();
  }, []);

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
