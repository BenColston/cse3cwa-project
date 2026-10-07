import { createSimulation, removeSimulation } from "@/lib/simulation";
import { emptyResponse, errorResponse, jsonResponse, serverErrorResponse } from "@/lib/apiResponses";

export function OPTIONS() {
  return emptyResponse();
}

export async function POST() {
  try {
    const created = await createSimulation();
    return jsonResponse({ message: created ? "Simulated records created." : "Simulated records already exist." }, { status: created ? 201 : 200 });
  } catch (error) {
    console.error("Failed to create simulated records", error);
    return serverErrorResponse();
  }
}

export async function DELETE() {
  try {
    if (!await removeSimulation()) {
      return errorResponse("Removal blocked: a teacher-created configuration uses a simulated word list. Move or delete that configuration first.", 409);
    }
    return jsonResponse({ message: "Simulated records removed. Teacher-created records preserved." });
  } catch (error) {
    console.error("Failed to remove simulated records", error);
    return serverErrorResponse();
  }
}
