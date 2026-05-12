import { NextRequest, NextResponse } from "next/server"

let mockProfile = "This is the mock profile text for Larreth Jimu."

export async function GET() {
  return NextResponse.json({ profile_text: mockProfile })
}

export async function PUT(request: NextRequest) {
  const { profile_text } = await request.json()
  mockProfile = profile_text
  return NextResponse.json({ success: true })
}