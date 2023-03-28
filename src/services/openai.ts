import { Configuration, OpenAIApi } from "openai";
import retry from "async-retry";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function getEmbeddings(texts: string[]): Promise<number[]> {
  return await retry(
    async () => {
      // ? https://platform.openai.com/docs/guides/embeddings
      const response = await openai.createEmbedding({
        input: texts,
        model: "text-embedding-ada-002",
      });

      const data = response.data;
      return data.data[0].embedding;
    },
    { retries: 3, minTimeout: 1000, maxTimeout: 20000, factor: 2 }
  );
}

export async function getChatCompletion(
  messages: any[],
  model = "gpt-3.5-turbo"
): Promise<string> {
  return await retry(
    async () => {
      // ? https://platform.openai.com/docs/guides/chat
      const response = await openai.createChatCompletion({
        model: model,
        messages: messages,
      });

      const data = response.data;
      const completion = data.choices[0].message?.content || "";
      console.log(`Completion: ${completion}`);
      return completion;
    },
    { retries: 3, minTimeout: 1000, maxTimeout: 20000, factor: 2 }
  );
}
