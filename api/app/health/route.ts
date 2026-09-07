export async function GET() {
  return Response.json(
    {
      status: "ok",
      service: "cse3cwa-api",
    },
    { status: 200 },
  );
}
