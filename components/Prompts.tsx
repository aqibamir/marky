import React, { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useEffect } from "react";

interface ApiResponse {
  prompt: string;
}

const Prompts = ({ setNewPrompt }: any) => {
  const [prompt, setPrompt] = useState("");

  async function generatePrompt() {
    console.log("here");
    let res = await fetch("../api/getPrompt");
    const json: ApiResponse = await res.json();
    console.log(json.prompt);
    setPrompt(json.prompt);
    setNewPrompt(json.prompt);
  }

  function onInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(event.target.value);
    setNewPrompt(event.target.value);
  }

  useEffect(() => {
    const textarea = document.getElementById(
      "promptTextarea"
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height to auto
      textarea.style.height = `${textarea.scrollHeight}px`; // Set height to the scroll height
    }
  }, [prompt]);

  return (
    <div className="pb-8 flex flex-col items-center border-zinc-950 w-full outline-2">
      <div className="w-full">
        <Textarea
          id="promptTextarea"
          className="min-h-[100px] text-lg italic "
          placeholder="Your essay prompt here !"
          value={prompt}
          onChange={onInputChange}
        />
      </div>
      <div className="pt-5 text-center">
        <p className="pb-5"> OR </p>
        <Button onClick={generatePrompt}>🧙🏻‍♂️ Generate Prompt</Button>
      </div>
    </div>
  );
};

export default Prompts;
