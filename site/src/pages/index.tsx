import { type NextPage } from "next";
import Head from "next/head";

import React, { useState } from "react";
import { resumeExpertType, type messageType } from "~/utils/types";
import { useResumeExpert } from "~/utils/streamingapi";
import { useLocalResumeExpert } from "~/utils/localapi";

const Home: NextPage = () => {
  const [messages, setMessages] = useState<messageType[]>([]);
  const [prompt, setPrompt] = useState("");
  const [followupQuestions, setFollowupQuestions] = useState<string[]>([
    "What do you know about distributed systems?",
    "What was your longest role?",
    "What is a key skill you have developed through your work experience?",
  ]);
  const [localInference, setLocalInference] = useState(false);

  const openAIResumeExpert = useResumeExpert();
  const localResumeExpert = useLocalResumeExpert();

  const resumeExpert = (): resumeExpertType => {
    if (localInference) {
      return localResumeExpert;
    }
    return openAIResumeExpert;
  };

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
          {resumeExpert().modelState.isIdle ? (
            <div className="alert w-[85%] bg-amber-400">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 shrink-0 stroke-slate-950"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-left text-3xl text-slate-950">
                  This will download a 1.5GB model to your browser. Continue?
                </span>
              </div>
              <div>
                <button
                  className="btn-md btn border-gray-300 bg-gray-300 text-lg text-slate-950 hover:bg-amber-100"
                  onClick={() => setLocalInference(false)}
                >
                  Deny
                </button>
                <button
                  className="btn-md btn bg-slate-950 text-lg text-gray-300 hover:bg-amber-900"
                  onClick={() => resumeExpert().fetchModel()}
                >
                  Accept
                </button>
              </div>
            </div>
          ) : (
            <div className="container flex w-[85%] justify-between">
              <h2 className="text-3xl text-gray-300">
                Welcome to my{" "}
                <span className="text-amber-400">interactive</span> resume.
              </h2>
              {resumeExpert().modelState.isLoading ? (
                <label className="label flex cursor-pointer gap-2">
                  <progress className="progress progress-warning w-56"></progress>
                  <span className="text-lg text-gray-300">Loading Model</span>
                </label>
              ) : (
                <div className="form-control indicator">
                  {resumeExpert().modelState.isError && (
                    <div className="indicator-item indicator-middle indicator-end">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 shrink-0 stroke-amber-400"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                  )}
                  <label className="label flex cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      className="toggle toggle-lg border-gray-300 bg-gray-300 checked:border-amber-400 checked:bg-amber-400"
                      checked={localInference}
                      onChange={(e) => setLocalInference(e.target.checked)}
                    />
                    <span className="text-lg text-gray-300">
                      <span className="text-amber-400">Local</span> Inference
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}
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
              {resumeExpert().askAboutResumeState.isLoading && (
                <div className="flex w-full flex-col items-center justify-center bg-transparent pt-5">
                  <progress className="progress progress-info w-[85%]"></progress>
                </div>
              )}
              {resumeExpert().askAboutResumeState.isError && (
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
                      Error! {resumeExpert().askAboutResumeState.error?.message}
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
                  setMessages(copyMessages);
                  setPrompt("");
                  resumeExpert().mutate(
                    {
                      askAboutResumeInput: {
                        messages: copyMessages,
                      },
                      suggestFollowupQuestionsInput: {
                        lastQuestion: lastQuestion,
                      },
                    },
                    {
                      onAskAboutResumeSuccess: (data) => {
                        if (data.response) {
                          setMessages(data.response);
                        }
                      },
                      onSuggestFollowupQuestionsSuccess: (data) => {
                        if (data.response) {
                          setFollowupQuestions(data.response);
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
                  disabled={
                    resumeExpert().askAboutResumeState.isLoading ||
                    !resumeExpert().modelState.isSuccess
                  }
                />
                <button
                  className="btn-lg btn bg-amber-400 text-slate-950 hover:bg-gray-300"
                  disabled={
                    resumeExpert().askAboutResumeState.isLoading ||
                    !resumeExpert().modelState.isSuccess
                  }
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
        <div
          className={`container flex flex-col items-center justify-center gap-2 px-4 py-16 ${
            resumeExpert().suggestFollowupQuestionsState.isLoading
              ? "animate-pulse"
              : ""
          }`}
        >
          <h2 className="text-4xl font-bold text-gray-300">
            <span className="text-amber-400">Dynamic</span> Example Prompts
          </h2>
          <ul className="menu w-[60%] bg-transparent p-2">
            {followupQuestions.map((obj, i) => (
              <li
                className={`pb-2 ${
                  resumeExpert().suggestFollowupQuestionsState.isLoading ||
                  !resumeExpert().modelState.isSuccess
                    ? "disabled"
                    : ""
                }`}
                key={i}
              >
                {resumeExpert().suggestFollowupQuestionsState.isLoading ? (
                  <div className="border-2 border-gray-600 text-2xl text-gray-300">
                    {obj}
                  </div>
                ) : (
                  <a
                    className="bg-slate-950 text-2xl text-gray-300 hover:bg-amber-400 hover:text-slate-950"
                    onClick={(_e) => {
                      setPrompt(obj);
                    }}
                  >
                    {obj}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
};

export default Home;
