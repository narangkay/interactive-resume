import { type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
import React, { useState } from "react";

type messageType = { role: "user" | "assistant"; content: string };

const Home: NextPage = () => {
  const [messages, setMessages] = useState<messageType[]>([]);
  const [prompt, setPrompt] = useState("");
  const [followupQuestions, setFollowupQuestions] = useState<string[]>([
    "What do you know about distributed systems?",
    "What was your longest role?",
    "What is a key skill you have developed through your work experience?",
  ]);

  const askAboutResume = api.openai.askAboutResume.useMutation();
  const suggestFollowupQuestions = api.openai.suggestFollowupQuestions.useMutation();

  return (
    <>
      <Head>
        <title>Krish Narang&apos;s Resume</title>
        <meta
          name="description"
          content="An interactive resume for Krish Narang."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="container flex flex-col items-center justify-center gap-2 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-300 sm:text-[5rem]">
            Krish Narang
          </h1>
          <h2 className="text-2xl text-gray-300">
            Senior Software Engineer, Google
          </h2>
        </div>
        <div className="container flex flex-col items-center justify-center gap-2 px-4 py-16 ">
          <h2 className="w-[85%] text-3xl text-gray-300">
            Welcome to my <span className="text-amber-400">interactive</span>{" "}
            resume.
          </h2>
          <div className="relative h-full w-[85%] bg-transparent">
            <div className="w-full">
              {messages.map((obj, i) => (
                <div key={i}>
                  {/* user message */}
                  {obj.role === "user" && (
                    <div className="chat chat-start pb-5">
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full bg-gray-300" />
                      </div>
                      <div className="chat-bubble bg-slate-950 text-2xl text-gray-300">
                        {obj.content}
                      </div>
                    </div>
                  )}
                  {/* the chatgpt message */}
                  {obj.role === "assistant" && (
                    <div className="chat chat-end pb-5">
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full bg-slate-950" />
                      </div>
                      <div className="chat-bubble bg-gray-300 text-2xl text-slate-950">
                        {obj.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {askAboutResume.isLoading && (
                <div className="flex w-full flex-col items-center justify-center bg-transparent pt-5">
                  <progress className="progress progress-info w-[85%]"></progress>
                </div>
              )}
              {askAboutResume.isError && (
                <div className="alert alert-error shadow-lg">
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 flex-shrink-0 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      Error! Open AI returned an error:{" "}
                      {askAboutResume.error.message}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex w-full flex-col items-center justify-center bg-transparent">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!prompt) {
                    alert("prompt is empty");
                    return;
                  }
                  const copyMessages: messageType[] = [
                    ...messages,
                    {
                      role: "user",
                      content: prompt,
                    },
                  ];
                  const lastQuestion = prompt;
                  askAboutResume.mutate(
                    {
                      messages: copyMessages,
                    },
                    {
                      onSuccess: (data) => {
                        setMessages(copyMessages);
                        if (data.response) {
                          setMessages((prev) => [
                            ...prev,
                            {
                              role: "assistant",
                              content: data.response,
                            },
                          ]);
                        }
                        setPrompt("");
                      },
                    }
                  );
                  suggestFollowupQuestions.mutate(
                    { lastQuestion: lastQuestion },
                    {
                      onSuccess: (data) => {
                        if (data.followupQuestions) {
                          setFollowupQuestions(data.followupQuestions);
                        }
                      },
                    }
                  );
                }}
                className="form-control w-full flex-row space-x-3"
              >
                <input
                  type="text"
                  placeholder="What would you like to know?"
                  className="input-bordered input input-lg w-full text-2xl text-gray-300"
                  onChange={(e) => {
                    setPrompt(e.target.value);
                  }}
                  value={prompt}
                  disabled={askAboutResume.isLoading}
                />
                <button className="btn-lg btn bg-amber-400 text-slate-950 hover:bg-gray-300">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="container flex flex-col items-center justify-center gap-2 px-4 py-16 ">
          <h2 className="text-4xl font-bold text-gray-300"><span className="text-amber-400">Dynamic</span> Example Prompts</h2>
          <ul className="menu w-[60%] bg-transparent p-2">
            {followupQuestions.map((obj, i) => (
              <li className="pb-2" key={i}>
                <a
                  className="bg-slate-950 text-2xl text-gray-300 hover:bg-amber-400 hover:text-slate-950"
                  onClick={(_e) => {
                    setPrompt(obj);
                  }}
                >
                  {obj}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
};

export default Home;
