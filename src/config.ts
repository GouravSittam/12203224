import { AppConfig, AuthCredentials } from "./types";

export const appConfig: AppConfig = {
  port: parseInt(process.env.PORT || "3000", 10),
  host: process.env.HOST || "localhost",
  defaultValidity: 30,
  shortcodeLength: 6,
  maxCustomShortcodeLength: 20,
  allowedShortcodeChars:
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
};

export const authCredentials: AuthCredentials = {
  email: "gourav@lpu.in",
  name: "gourav",
  rollNo: "12203224",
  accessCode: "CZypQK",
  clientID: "c5cd716f-2273-456f-b144-42036577b35b",
  clientSecret: "nPVsgzumsVSvsykP",
  mobileNo: "7018389510",
  githubUsername: "gouravsittam",
};
