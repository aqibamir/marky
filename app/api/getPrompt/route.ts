import { GoogleVertexAI } from "langchain/llms/googlevertexai";
import { NextRequest, NextResponse } from "next/server";

// This route calls out to Google Vertex AI on every request, so it must
// never be statically prerendered at build time (doing so runs the call
// with build-time credentials and breaks the build if they aren't
// configured there).
export const dynamic = "force-dynamic";

type ResponseBody = { prompt: string };

export async function GET(): Promise<NextResponse<ResponseBody>> {
  const model = new GoogleVertexAI({
    temperature: 0.1,
  });

  const prompt = await model.call(
    "You need to give me a prompt for an IELTS writing task 2 essay.Only return the prompt do not add anything before or after the prompt"
  );

  return NextResponse.json({ prompt: prompt });
}
