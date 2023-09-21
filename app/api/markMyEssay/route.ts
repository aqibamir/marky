import { GoogleVertexAI } from "langchain/llms/googlevertexai";
import { NextRequest, NextResponse } from "next/server";

type ResponseBody = { marked: string };
type RequestBody = { essayPrmopt: string; essay: string } | null;

export async function POST(
  request: NextRequest
): Promise<NextResponse<ResponseBody>> {
  const model = new GoogleVertexAI({
    temperature: 0.7,
  });

  if (request.body == null) {
    return NextResponse.json({ marked: "NO INPUT" });
  }
  const req = await request.json();
  let llmPrompt =
    "You are an expert IELTS examiner and you will mark my essay given below. You will mark this essay according to the offical IELTS guidelines.You have to be very strict. Even If you find a single mistake you have to tell me. You also have to be convervative while assigning the band score. IMPORTANT : YOU HAVE TO GIVE BAND SCORE IN ALL THE AREAS IELTS CHECKS IN WRITING TASK 2 ";
  llmPrompt =
    llmPrompt +
    `/n {ESSAY PROMPT} : ${req.essayPrompt} /n {MY ANSWER} : ${req.essay}`;
  const res = await model.call(llmPrompt);

  console.log(llmPrompt);
  return NextResponse.json({ marked: res });
}
