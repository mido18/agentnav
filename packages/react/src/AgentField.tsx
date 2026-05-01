"use client";

import React from "react";

export type AgentFieldProps = React.HTMLAttributes<HTMLSpanElement> & {
  name: string;
  value?: string | number | boolean;
  currency?: string;
};

export function AgentField({ name, value, currency, children, ...props }: AgentFieldProps): React.ReactElement {
  return (
    <span
      {...props}
      data-agent-field={name}
      {...(value !== undefined ? { "data-agent-value": String(value) } : {})}
      {...(currency ? { "data-agent-currency": currency } : {})}
    >
      {children}
    </span>
  );
}
