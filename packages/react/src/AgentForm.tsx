"use client";

import React, { useEffect } from "react";
import { isConfirmationRisk, type AgentForm as AgentFormType, type AgentRisk } from "@agentnav/core";
import { useAgentNav } from "./useAgentNav";

export type AgentFormProps = {
  id: string;
  name?: string;
  risk?: AgentRisk;
  requiresUserConfirmation?: boolean;
  children: React.ReactElement;
};

export function AgentForm({
  id,
  name,
  risk = "shares_personal_data",
  requiresUserConfirmation,
  children
}: AgentFormProps): React.ReactElement {
  const { registerForm } = useAgentNav();
  const confirmation = requiresUserConfirmation ?? isConfirmationRisk(risk);
  const form: AgentFormType = {
    id,
    ...(name ? { name } : {}),
    method: "POST",
    fields: [],
    requiresUserConfirmation: confirmation,
    risk,
    confidence: 1
  };

  useEffect(() => {
    registerForm(form);
  }, [form, registerForm]);

  if (!React.isValidElement<Record<string, unknown>>(children)) {
    return (
      <form data-agent-form={id} data-agent-risk={risk} data-agent-requires-confirmation={String(confirmation)}>
        {children}
      </form>
    );
  }

  return React.cloneElement(children, {
    "data-agent-form": id,
    "data-agent-risk": risk,
    "data-agent-requires-confirmation": String(confirmation)
  });
}
