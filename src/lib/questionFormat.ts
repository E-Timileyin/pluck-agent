export const IMPORT_TIER = "SP3";

export const QUESTION_JSON_EXAMPLE = `{
  "tier": "SP3",
  "questions": [
    {
      "question": "A customer wants to pay their weekly instalment in cash. What do you do?",
      "options": [
        "Collect it and transfer it yourself later",
        "Direct the payment to a company-approved account only",
        "Keep it until the field officer visits",
        "Ask a colleague to collect it for you"
      ],
      "answer": "Direct the payment to a company-approved account only",
      "critical": true
    },
    {
      "question": "What does a credit check tell you about a customer?",
      "options": [
        "Whether they can be approved for a device today",
        "Exactly how much they earn each month",
        "Which products they have bought before",
        "Nothing — it is a formality"
      ],
      "answer": "Whether they can be approved for a device today",
      "critical": false
    }
  ]
}`;

export const QUESTION_PROMPT = `You are writing a multiple-choice quiz for Pluck sales agents in Nigeria.

Context: these are field sales agents selling smartphones, solar systems and motorcycles on credit, on SP3 (entry) tier. They read the training material on a phone, often on mobile data. The quiz decides whether they are certified to sell.

I will paste the training material below. Write quiz questions from it.

Rules:
- Only use facts stated in the material. Do not invent figures, rates or policies.
- If the material contradicts itself on a topic, skip that topic entirely and tell me which ones you skipped and why, AFTER the JSON.
- 4 options per question. Exactly one correct.
- Wrong options must be plausible to someone who skimmed — not obviously silly.
- Plain, direct English. Short sentences. No jargon a new agent would not know.
- Mark "critical": true for any question about customer money, customer data, or asset recovery. Those are compliance questions: an agent who gets one wrong fails the quiz whatever their overall score. Everything else is "critical": false.
- Aim for 10–15 questions unless I say otherwise.

Output format — return ONLY this JSON object, with no markdown code fence, no commentary before it, and nothing else in the file:

${QUESTION_JSON_EXAMPLE}

Field rules:
- "tier" is always "${IMPORT_TIER}".
- "answer" must be one of the strings in "options", copied character for character.
- 2 to 6 options per question, 4 preferred.
- No trailing commas. Straight quotes only.

Training material follows:
`;
