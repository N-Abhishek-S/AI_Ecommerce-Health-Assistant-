import { Client, Storage, ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import fs from "fs";
import path from "path";

const ENDPOINT = "https://nyc.cloud.appwrite.io/v1";
const PROJECT_ID = "68bd80b1003125eb303d";
const API_KEY = "standard_918a5a5fa03fe9ae5ebae34e417ad1ef846f47f61a9272fb9fe4dca983059aee301d65963623be898449df0ba1a659b7425f34e2c27a988d74a4351dcc4acd9481d7179c96090bc99b80def121fea18c76f0d2230c042bf8f2be3ecc8682243bb58dee445be3265205a15a7e9318b5a72ebc014238e2e390a84a338a9209d897";
const BUCKET_ID = "68c68de40027053fc338";

const IMAGE_FOLDER =
  "C:/Users/nagar/OneDrive/Desktop/AI_Ecommerce-Health-Assistant-/src/services/test";

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const storage = new Storage(client);

const files = fs.readdirSync(IMAGE_FOLDER);

(async () => {
  for (const file of files) {
    const filePath = path.join(IMAGE_FOLDER, file);

    if (!fs.statSync(filePath).isFile()) continue;

    try {
      await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        InputFile.fromPath(filePath)
      );

      console.log(`✅ Uploaded: ${file}`);
    } catch (err) {
      console.error(`❌ Failed: ${file}`, err.message);
    }
  }
})();
