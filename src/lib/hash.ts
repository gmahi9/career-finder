import type { Answers, Question } from "./types";

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string): string {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeAnswers(answers: Answers): string {
  const payload = Object.keys(answers)
    .sort()
    .map((key) => `${key}=${answers[key]}`)
    .join("&");
  return `r=${toBase64Url(payload)}`;
}

export function decodeAnswers(hash: string, questions: Question[]): Answers | null {
  const trimmed = hash.replace(/^#/, "");
  if (!trimmed.startsWith("r=")) return null;
  let payload = "";
  try {
    payload = fromBase64Url(trimmed.slice(2));
  } catch {
    return null;
  }
  const parsed: Answers = {};
  if (!payload) return null;
  for (const pair of payload.split("&")) {
    const splitAt = pair.indexOf("=");
    if (splitAt <= 0) return null;
    parsed[pair.slice(0, splitAt)] = pair.slice(splitAt + 1);
  }
  for (const question of questions) {
    const choice = parsed[question.id];
    if (!choice || !question.options.some((option) => option.id === choice)) return null;
  }
  return parsed;
}
