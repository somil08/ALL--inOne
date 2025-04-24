
import {client } from "@repo/db/client";

export default async function Home() {
  const user = await client.user.findFirst();
  return (
    <div>
      {user?user.username:"No user found"}
      {user?user.password:"No user found"}
    </div>
  );
}
