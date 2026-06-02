import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
export async function chunk(text: string):Promise<Document[]>{ // returns a 1d array as each document is a whole object
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.createDocuments([text]); //takes one huge text string and converts it into multiple smaller LangChain Documents (chunks).
  console.log(docs);
  return docs;
}