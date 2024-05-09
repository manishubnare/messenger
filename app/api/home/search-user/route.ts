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
      My Data: ${currentUser}
      All User Data: ${input}
      embeddings: ${JSON.stringify(embeddings)}
      ---------------------
      Query: Given these all users data and my data in the context, 
      please output 2 users in json format from all user data which has a close match to my user data. 
      You can compare the data with any characteristics provided in the user data or 1 user if the total number of users <= 1. 
      The result must only contain the 'data' and 'user' keys and no other text or explanatory sentences. 
      Please strictly follow the format given below.
      --- format given below ---
      {
         data: // Matched full user data in JSON format
         user: [{
           id: // matched user id
           email: // matched user email,
           message: // similarity message
         }]
      }
      Please make sure that the response does not contain any explanatory sentences or additional text, 
      and only includes the 'data' and 'user' keys as specified in the format. 
      The 'message' key should contain a similarity message, such as 'You are both in the same profession' or 'You both live around the address', based on the characteristics of the matched users.
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
        queryContent.data.filter(
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
