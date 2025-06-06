import { NextResponse } from 'next/server';
import { client } from '@repo/db/client';

export async function GET() {
  const users = await client.user.findMany();
  return NextResponse.json(users);
}
