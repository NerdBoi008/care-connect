'use server'

import { ID, Query, } from "node-appwrite";
import { BUCKET_ID, DATABASE_ID, PATIENT_COLLECTION_ID, storage, users, ENDPOINT, PROJECT_ID, databases, } from "../appwrite.config";
import { parseStringify } from "../utils";


// Create appwrite user
export const createUser = async (user: CreateUserParams) => {
    try {
        // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
        const newuser = await users.create(
          ID.unique(),
          user.email,
          user.phone,
          undefined,
          user.name
        );
        
        return parseStringify(newuser);

      } catch (error: any) {
        // Check existing user
        if (error && error?.code === 409) {
            const existingUser = await users.list([
                Query.equal("email", [user.email]),
            ]);
            return existingUser.users[0];
        }
        console.error("An error occurred while creating a new user:", error);
      }
}

export async function getUser(userId: string) {
  try {
    const user = await users.get(userId)

    return parseStringify(user)
    
  } catch (error) {
    console.error(error);
    
  }
}

export async function getPatient(userId: string) {
  try {
    const patient = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal('userId', userId)]
    )

    return parseStringify(patient.documents[0])
    
  } catch (error) {
    console.error(error);
    
  }
}



export async function registerPatient({ identificationDocument, ...patient }: RegisterUserParams) {

  function createFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName)
  }

  try {
    // Upload file ->  // https://appwrite.io/docs/references/cloud/client-web/storage#createFile
    let file;
    if (identificationDocument) {
      
      const inputFile = createFile(
        identificationDocument?.get("blobFile") as Blob,
        identificationDocument?.get("fileName") as string
      )
        
      console.log({
        filePath: 'E:\\Programming\\React Test\\careconnect\\lib\\actions\\patient.actions.ts',
        output: inputFile
      });

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }
  

    // Create new patient document -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#createDocument
    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        identificationDocumentId: file?.$id || null,
        identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view??project=${PROJECT_ID}`,
        ...patient,
      }
    );

    return parseStringify(newPatient);

  } catch (error) {
    console.error("[-] An error occurred while creating a new patient:", error);
  }
}