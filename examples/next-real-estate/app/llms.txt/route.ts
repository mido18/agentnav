import config from "../../agentnav.config";
import { createLlmsTxtRoute } from "@agentnav/next";

export const GET = createLlmsTxtRoute(config);
