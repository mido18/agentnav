"use client";

import { useContext } from "react";
import { AgentNavContext } from "./AgentNavProvider";

export function useAgentNav() {
  const context = useContext(AgentNavContext);
  if (!context) {
    throw new Error("useAgentNav must be used inside AgentNavProvider.");
  }
  return context;
}
