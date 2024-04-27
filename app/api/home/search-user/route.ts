import getMistralApiClient from "@/actions/getMistralApiClient";
import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import getCurrentUser from "@/actions/getCurrentUser";
import { get, map, uniq } from "lodash";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const mistralClient = await getMistralApiClient();
    const body = await request.json();
    const { input } = body;
    const response = await mistralClient.embeddings({
      model: "mistral-embed",
      input: input,
    });
    const embeddings = response.data[0].embedding;

    const prompt = `
      Context information is below.
      ---------------------
      user data: ${input}
      embeddings: ${JSON.stringify(embeddings)}
      ---------------------
      Given the context information and not prior knowledge, answer the query.
      Query: Given these users in the context please output 2 users in json format or 1 user if total number of user <= 1. 
      Must contain the user data only and no other text.
      Answer:
    `

    const getUserData = await mistralClient.chat({
      model: "mistral-large-latest",
      messages: [{ role: "user", content: prompt }],
    });

    if(getUserData.choices[0].message.content){
      await prisma.user.update({
        where: {
          email: currentUser?.email || "",
        },
        data: {
          token: currentUser?.token ? currentUser?.token - 1 : 0,
        },
      });
    }

    const queryContent = JSON.parse(getUserData.choices[0].message.content);

    const existingConnectedUser = await prisma.connectedUsers.findUnique({
      where: {
        userId: currentUser?.id,
      },
    });

    const existingConnectedUserIds = existingConnectedUser?.connectedUserIds;
    const updatedConnectedUserIds = uniq([
      ...(existingConnectedUserIds || []),
      ...map(
        queryContent.filter(
          (id: string) => !existingConnectedUserIds?.includes(id)
        ),
        "id"
      ),
    ]);

    await prisma.connectedUsers.upsert({
      where: { userId: currentUser?.id },
      create: {
        userId: get(currentUser, "id", ""),
        connectedUserIds: updatedConnectedUserIds,
      },
      update: {
        connectedUserIds: updatedConnectedUserIds,
      },
    });

    return NextResponse.json(queryContent);
  } catch (error) {
    throw new Error("Failed");
  }
}
