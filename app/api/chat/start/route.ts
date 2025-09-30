import { NextResponse } from "next/server";

export async function POST() {
  // TODO: integrate with DB to create a real session
  const sessionId = `sess_${Math.random().toString(36).slice(2)}`;
  return NextResponse.json({ success: true, sessionId, createdAt: new Date().toISOString() });
}
