import { GoogleVertexAI } from "langchain/llms/googlevertexai";
import { NextRequest, NextResponse } from "next/server";

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
