"use client";

import React, { useEffect } from "react";
import { normalizeAction, type AgentAction as AgentActionType, type AgentRisk } from "@agentnav/core";
import { useAgentNav } from "./useAgentNav";

export type AgentActionProps = {
  id: string;
  name?: string;
  description?: string;
  type: AgentActionType["type"];
  method?: AgentActionType["method"];
  endpoint?: string;
  risk?: AgentRisk;
  safe?: boolean;
  requiresUserConfirmation?: boolean;
  children: React.ReactElement;
};

export function AgentAction({
  id,
  name,
  description,
  type,
  method,
  endpoint,
  risk = "unknown",
  safe = false,
  requiresUserConfirmation = false,
  children
}: AgentActionProps): React.ReactElement {
  const { registerAction } = useAgentNav();
  const actionName = name || description || id;
  const action = normalizeAction({
    id,
    name: actionName,
    ...(description ? { description } : {}),
    type,
    ...(method ? { method } : {}),
    ...(endpoint ? { endpoint } : {}),
    safe,
    requiresUserConfirmation,
    risk,
    confidence: 1,
    source: "explicit"
  });

  useEffect(() => {
    registerAction(action);
  }, [action, registerAction]);

  if (!React.isValidElement<Record<string, unknown>>(children)) {
    return <span>{children}</span>;
  }

  return React.cloneElement(children, {
    "data-agent-action": id,
    "data-agent-action-type": type,
    "data-agent-risk": action.risk,
    "data-agent-requires-confirmation": String(action.requiresUserConfirmation),
    ...(description ? { "data-agent-description": description } : {})
  });
}
