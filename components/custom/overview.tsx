import { motion } from "framer-motion";
import Link from "next/link";

import { LogoGoogle, MessageIcon, VercelIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <p className="text-zinc-900 dark:text-zinc-50 font-semibold text-base text-center">
          Welcome to Avion Rezervation Chatbot
        </p>
        <p>
          <strong>Avion Rezervation Chatbot</strong> is your intelligent travel assistant for searching, booking, and managing flights—all through a natural conversation. Instantly find real-time flights, compare prices, select your preferred seat, and complete your reservation in one seamless chat experience.
        </p>
        <ul className="list-disc ml-6">
          <li>Conversational flight search and booking</li>
          <li>Real-time flight data and pricing</li>
          <li>Interactive seat selection by class</li>
          <li>Easy payment and instant boarding pass</li>
          <li>Personalized, secure, and user-friendly</li>
        </ul>
        <p>
          Start chatting to plan your next journey with ease—no forms, no hassle, just results.
        </p>
      </div>
    </motion.div>
  );
};
