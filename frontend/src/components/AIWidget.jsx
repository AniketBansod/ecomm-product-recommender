import React from "react";
import { Brain } from "lucide-react";

export default function AIWidget({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl transition transform hover:scale-105"
    >
      <Brain size={28} />
    </button>
  );
}
