"use client";

import React, { useEffect } from "react";
import type { AgentEntity as AgentEntityType } from "@agentnav/core";
import { useAgentNav } from "./useAgentNav";

export type AgentEntityProps = React.HTMLAttributes<HTMLDivElement> & {
  id: string;
  type: AgentEntityType["type"];
  name?: string;
  description?: string;
  url?: string;
  fields?: Record<string, unknown>;
};

export function AgentEntity({
  id,
  type,
  name,
  description,
  url,
  fields,
  children,
  ...props
}: AgentEntityProps): React.ReactElement {
  const { registerEntity } = useAgentNav();

  useEffect(() => {
    registerEntity({
      id,
      type,
      ...(name ? { name } : {}),
      ...(description ? { description } : {}),
      ...(url ? { url } : {}),
      ...(fields ? { fields } : {}),
      confidence: 1,
      source: "explicit"
    });
  }, [description, fields, id, name, registerEntity, type, url]);

  return (
    <div
      {...props}
      data-agent-entity={type}
      data-agent-id={id}
      {...(name ? { "data-agent-name": name } : {})}
      {...(description ? { "data-agent-description": description } : {})}
    >
      {children}
    </div>
  );
}
