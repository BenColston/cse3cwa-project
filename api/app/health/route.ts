import { jsonResponse } from "@/lib/apiResponses";

export async function GET() {
  return jsonResponse(
    {
      status: "ok",
      service: "cse3cwa-api",
    },
    { status: 200 },
  );
}
