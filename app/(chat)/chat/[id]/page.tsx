import { CoreMessage } from "ai";
import { notFound } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { CalendarDay } from "@/components/custom/calendar";
import { getChatById } from "@/db/queries";
import { Chat } from "@/db/schema";
import { convertToUIMessages } from "@/lib/utils";
import type { Message } from "ai";

export default async function Page({ params }: { params: any }) {
  const { id } = params;
  const chatFromDb = await getChatById({ id });

  if (!chatFromDb) {
    notFound();
  }

  // type casting and converting messages to UI messages
  const chat: Chat = {
    ...chatFromDb,
    messages: convertToUIMessages(chatFromDb.messages as Array<CoreMessage>),
  };

  // --- Inject test message for Calendar UI ---
  const mockAvailableDates: CalendarDay[] = [
    { date: "2025-07-16", price: 167, currency: "EUR", available: true },
    { date: "2025-07-17", price: 168, currency: "EUR", available: true },
    { date: "2025-07-18", price: 153, currency: "EUR", available: true },
    { date: "2025-07-19", price: 217, currency: "EUR", available: true },
    { date: "2025-07-20", price: 71, currency: "EUR", available: true },
    { date: "2025-07-21", price: 98, currency: "EUR", available: true },
    { date: "2025-07-22", price: null, currency: "EUR", available: false },
    { date: "2025-07-23", price: 123, currency: "EUR", available: true },
  ];
  const calendarTestMessage: Message = {
    id: "calendar-test-1",
    role: "assistant",
    content: "",
    toolInvocations: [
      {
        toolName: "selectDates",
        toolCallId: "calendar-1",
        state: "result",
        args: {}, // Add this line to satisfy ToolInvocation type
        result: {
          mode: "roundtrip",
          availableDates: mockAvailableDates,
          selected: null,
          currency: "EUR",
          currencies: ["EUR", "USD", "GBP"],
        },
      },
    ],
  };
  // Prepend the test message
  const initialMessages: Message[] = [calendarTestMessage, ...chat.messages];
  // --- End test message injection ---

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== chat.userId) {
    return notFound();
  }

  return <PreviewChat id={chat.id} initialMessages={initialMessages} />;
}
