import MistralClient from "@mistralai/mistralai";

const getMistralApiClient = async () => {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("Mistral API key not provided");
  }
  return new MistralClient(apiKey);
};

export default getMistralApiClient;
