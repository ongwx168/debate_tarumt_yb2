import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({
    version: "1.0",
    type: "rich", 
    title: "TAR UMT Debate Voting System",
    provider_name: "TAR UMT",
    provider_url: "https://chinesedebate-tarumt-yb.vercel.app",
    html: `<iframe src="https://chinesedebate-tarumt-yb.vercel.app" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`,
    width: 800,
    height: 600
  });
}