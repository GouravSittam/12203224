import axios from "axios";

// Log levels and packages as per backend constraints
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type LogPackage =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style"
  | "auth"
  | "config"
  | "middleware"
  | "utils";

const LOGGING_API_URL = "http://localhost:3000/log"; // You may need to proxy this to your backend

export async function log(level: LogLevel, pkg: LogPackage, message: string) {
  try {
    await axios.post(LOGGING_API_URL, {
      stack: "frontend",
      level,
      package: pkg,
      message,
    });
  } catch (error) {
    // Fallback: do nothing or optionally use console.error in dev
  }
}

export const logger = {
  debug: (pkg: LogPackage, message: string) => log("debug", pkg, message),
  info: (pkg: LogPackage, message: string) => log("info", pkg, message),
  warn: (pkg: LogPackage, message: string) => log("warn", pkg, message),
  error: (pkg: LogPackage, message: string) => log("error", pkg, message),
  fatal: (pkg: LogPackage, message: string) => log("fatal", pkg, message),
};
