import { NextResponse } from "next/server";

const NOT_FOUND_MESSAGES = new Set([
  "Post not found",
  "Creator not found",
  "Parent comment not found",
]);

const validationMessage = (error) => {
  if (error?.name === "ZodError") return error.issues?.[0]?.message;
  if (error instanceof SyntaxError) return "Invalid JSON body";
  if (/^(Invalid|Unsupported)/.test(error?.message || "")) return error.message;
  return null;
};

export function consumerErrorResponse(error, fallbackMessage) {
  if (NOT_FOUND_MESSAGES.has(error?.message)) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const message = validationMessage(error);
  if (message) return NextResponse.json({ error: message }, { status: 400 });

  console.error(fallbackMessage, error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
