import { getChatCompletion } from "./openai";

async function screen_text_for_pii(text: string): Promise<boolean> {
  const messages = [
    {
      role: "system",
      content: `
      You can only respond with the word "True" or "False", where your answer indicates whether the text in the user's message contains PII.
      Do not explain your answer, and do not use punctuation.
      Your task is to identify whether the text extracted from your company files
      contains sensitive PII information that should not be shared with the broader company. Here are some things to look out for:
      - An email address that identifies a specific person in either the local-part or the domain
      - The postal address of a private residence (must include at least a street name)
      - The postal address of a public place (must include either a street name or business name)
      - Notes about hiring decisions with mentioned names of candidates. The user will send a document for you to analyze.
      `,
    },
    { role: "user", content: text },
  ];

  const completion = await getChatCompletion(messages);

  if (completion.startsWith("True")) {
    return true;
  }

  return false;
}
