"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useEffect, useState } from "react";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      id,
      body: { id },
      initialMessages,
      maxSteps: 10,
      onFinish: () => {
        window.history.replaceState({}, "", `/chat/${id}`);
      },
    });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, messagesEndRef]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      {/* Show Overview only when there are no messages */}
      {messages.length === 0 && (
        <div className="w-full flex flex-col items-center">
          <Overview />
        </div>
      )}
      {/* Scrollable Chat Area */}
      {messages.length > 0 && (
        <div className="flex-1 flex flex-col items-center w-full overflow-y-auto pb-32">
          <div
            ref={messagesContainerRef}
            className="flex flex-col w-full items-center"
          >
            {messages.map((message) => (
              <PreviewMessage
                key={message.id}
                chatId={id}
                role={message.role}
                content={message.content}
                attachments={message.experimental_attachments}
                toolInvocations={message.toolInvocations}
              />
            ))}
            <div
              ref={messagesEndRef}
              className="shrink-0 min-w-[24px] min-h-[24px]"
            />
          </div>
        </div>
      )}
      {/* Fixed Bottom: Input */}
      <div className="fixed bottom-6 left-0 w-full z-40 bg-background pb-2 pt-2">
        <form className="flex flex-row gap-2 relative items-end w-full md:max-w-[650px] max-w-[calc(100dvw-32px),650px] px-4 md:px-0 mx-auto">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            append={append}
          />
        </form>
      </div>
      {/* Fixed Footer: Trademark */}
      <div className="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
        <div className="w-full flex justify-center mb-1">
          <span className="text-xs text-muted-foreground bg-background px-2 rounded pointer-events-auto">Avion is a registered trademark of Rifex United LLC</span>
        </div>
      </div>
    </div>
  );
}
