import { GET as handleGet, POST as handlePost } from "../payos/webhook/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  return handleGet();
}

export async function POST(req: Request) {
  return handlePost(req);
}
