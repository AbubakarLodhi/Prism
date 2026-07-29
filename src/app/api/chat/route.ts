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
          for await (const chunk of streamChatViaGemini(history, project)) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error("chat stream failed", error);
          controller.enqueue(
            encoder.encode(
              error instanceof Error ? `\n\n[error: ${error.message}]` : "\n\n[error]"
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("generate-chat failed", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Chat failed" }),
      { status: 500 }
    );
  }
}
