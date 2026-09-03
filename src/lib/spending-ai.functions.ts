import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  allowance: z.number(),
  monthLabel: z.string(),
  monthTotal: z.number(),
  weekTotal: z.number(),
  avgWeekly: z.number(),
  weeks: z.array(z.object({ week: z.number(), total: z.number() })),
  categories: z.array(z.object({ category: z.string(), total: z.number() })),
  recentDescriptions: z.array(
    z.object({ date: z.string(), description: z.string(), amount: z.number() }),
  ),
});

export const analyzeSpending = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured yet.");

    const prompt = `Here is a student's spending data in Indian Rupees (₹) for ${data.monthLabel}.

Monthly allowance: ₹${data.allowance}
Spent this month: ₹${data.monthTotal}
Spent this week: ₹${data.weekTotal}
Average weekly spend: ₹${Math.round(data.avgWeekly)}
Weekly totals: ${data.weeks.map((w) => `W${w.week}: ₹${w.total}`).join(", ")}
By category: ${data.categories.map((c) => `${c.category}: ₹${c.total}`).join(", ") || "none"}
Recent entries: ${
      data.recentDescriptions
        .map((r) => `${r.date} — ${r.description} (₹${r.amount})`)
        .join("; ") || "none"
    }

Write a short "this week's spending check".
Return exactly this structure:
SUMMARY: one or two friendly sentences about the week.
OBSERVATIONS: 3-4 bullet lines, each starting with "- ", covering where most money goes, biggest category share, whether weeks are consistent or unusual, and any recurring pattern in the descriptions.
TIPS: 2-3 bullet lines starting with "- " about tracking habits better.
Be warm, non-judgmental, never shaming, never tell them what they should or shouldn't buy. Use ₹ amounts from the data.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a gentle, encouraging personal finance journal companion. Never judge or moralise about purchases.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (res.status === 429)
      throw new Error("Too many requests just now — try again in a moment.");
    if (res.status === 402)
      throw new Error("AI credits are exhausted. Please top up to continue.");
    if (!res.ok) throw new Error("Could not generate a spending check right now.");

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return { text: json.choices?.[0]?.message?.content ?? "" };
  });
