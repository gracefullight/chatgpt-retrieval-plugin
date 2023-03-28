import { Source } from "../models/models";
import { getChatCompletion } from "./openai";

export async function extractMetadataFromDocument(
  text: string
): Promise<Record<string, string>> {
  const sources = Object.keys(Source);
  const sourcesString = sources.join(", ");
  const messages = [
    {
      role: "system",
      content: `Given a document from a user, try to extract the following metadata:
            - source: string, one of ${sourcesString}
            - url: string or don't specify
            - created_at: string or don't specify
            - author: string or don't specify

            Respond with a JSON containing the extracted metadata in key value pairs. If you don't find a metadata field, don't specify it.`,
    },
    { role: "user", content: text },
  ];

  const completion = await getChatCompletion(
    messages,
    "gpt-4" // TODO: change to your preferred model name
  );

  console.log(`completion: ${completion}`);

  let metadata: Record<string, string> = {};

  try {
    metadata = JSON.parse(completion);
  } catch (error) {
    metadata = {};
  }

  return metadata;
}
