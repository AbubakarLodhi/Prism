import { streamChatViaGemini, type ChatProjectContext, type ChatTurn } from "@/lib/gemini-server";

interface RequestBody {
  history: ChatTurn[];
  project?: ChatProjectContext;
}

export async function POST(request: Request) {
  try {
    const { history, project } = (await request.json()) as RequestBody;

    if (!Array.isArray(history) || history.length === 0) {
      return new Response(JSON.stringify({ error: "history is required" }), {
        status: 400,
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of streamChatViaGemini(history, project)) {
            controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
          }
        } catch (error) {
          console.error("chat stream failed", error);
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "text",
                text: error instanceof Error ? `\n\n[error: ${error.message}]` : "\n\n[error]",
              }) + "\n"
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
    });
  } catch (error) {
    console.error("generate-chat failed", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Chat failed" }),
      { status: 500 }
    );
  }
}
