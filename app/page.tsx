"use client";
import Prompts from "@/components/Prompts";
import Timer from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createContext, useState, useContext } from "react";
import ReactMarkdown from "react-markdown";

function getTimer(time: number): number {
  const currentTimeInMilliseconds = Date.now();
  const futureTimeInMilliseconds = currentTimeInMilliseconds + time * 60 * 1000;

  return futureTimeInMilliseconds;
}

interface ApiResponse {
  marked: string;
}

export default function Home() {
  const [essay, setEssay] = useState("");
  const [aiMarking, setaiMarking] = useState("");
  const [curentPrompt, setCurrentPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function markMyEssay() {
    try {
      setIsLoading(true);
      let res = await fetch("./api/markMyEssay", {
        method: "post",
        body: JSON.stringify({
          essay: essay,
          essayPrompt: curentPrompt,
        }),
      });
      let answer: ApiResponse = await res.json();

      setaiMarking(answer.marked);
    } catch (error) {
      console.error(error);
      // Add error handling
    } finally {
      setIsLoading(false);
    }
  }

  function writeEssay(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setEssay(event.target.value);
  }

  function setNewPrompt(prompt: string) {
    setCurrentPrompt(prompt);
  }

  return (
    <main className="flex h-screen bg-green-150">
      <div className="w-1/4 border border-lime-500 rounded-md p-4 mr-4 text-center">
        <div className="mb-2 font-bold text-lg">Time Remaining</div>
        <div className="border border-gray-300 rounded-md p-2">
          <Timer countDownTime={getTimer(40)} />
        </div>
      </div>
      <div className="flex-1 border border-lime-500 rounded-md p-4 text-center">
        <Prompts setNewPrompt={setNewPrompt} />
        <Textarea
          placeholder="Write a tagline for an ice cream shop"
          className="w-full min-h-[400px] p-4 text-lg border border-gray-300 rounded-md mb-4 focus:outline-none"
          value={essay}
          onChange={writeEssay}
          style={{ resize: "vertical" }}
        />
        <Button onClick={markMyEssay} disabled={isLoading}>
          {isLoading ? "Loading..." : "Submit Test"}
        </Button>
        {aiMarking && (
          <div className="mt-4">
            <h2>Marked Answer</h2>
            <div className="border border-gray-300 rounded-md p-4">
              <ReactMarkdown>{aiMarking}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
