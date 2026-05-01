import config from "../../../agentnav.config";
import { createAgentJsonRoute } from "@agentnav/next";

export const GET = createAgentJsonRoute(config);
