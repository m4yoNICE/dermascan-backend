import { checkImgPython } from "../utils/python.checkImageQuality.js";
import { skinAnalyze } from "../utils/python.serverSkinAnalysis.js";
import { createStoredImage } from "../services/imagesServices.js";
import {
  getTransactionWithCondition,
  mapSkinResultToCatalog,
} from "../services/skinAnalysisDBMapping.js";
import { skinAnalysis } from "../drizzle/schema.js";
import { db } from "../config/db.js";
import { eq } from "drizzle-orm";
import { uploadToImageKit } from "../utils/imageKitUpload.js";

export async function analyzeSkinOrchestrator(userId, imageBuffer) {
  const startTime = Date.now();
  console.log(
    `\n[${new Date().toISOString()}] >>> STARTING ANALYSIS for User: ${userId}`,
  );
  try {
    console.log(
      `[${Date.now() - startTime}ms] Running Python Quality Check...`,
    );
    const imgQuality = await checkImgPython(imageBuffer);
    if (!imgQuality.ok) {
      return {
        statusCode: 200,
        payload: {
          result: "failed",
          message: "The photo is unclear. Please retake the picture.",
        },
      };
    }
    console.log(`[${Date.now() - startTime}ms] Quality Check PASSED.`);

    // === SKIN ANALYSIS ===
    console.log(`[${Date.now() - startTime}ms] Launching Python Skin AI...`);
    const skinResult = await skinAnalyze(imageBuffer);
    console.log();
    console.log(skinResult);
    console.log();
    console.log(
      `[${Date.now() - startTime}ms] Python AI returned raw results.`,
    );

    console.log(
      `[${Date.now() - startTime}ms] Mapping results to database catalog...`,
    );
    let transaction = await mapSkinResultToCatalog(userId, skinResult);

    if (!transaction) {
      console.error(
        `[${Date.now() - startTime}ms] DATABASE ERROR: Transaction mapping failed.`,
      );
      return {
        statusCode: 404,
        payload: { error: "Failed to save data to skin analysis transaction" },
      };
    }

    console.log(
      `[${Date.now() - startTime}ms] Transaction Created. ID: ${transaction.id}`,
    );

    const status = transaction.status.toLowerCase();
    console.log(
      `[${Date.now() - startTime}ms] Transaction Status: ${status.toUpperCase()}`,
    );
    let imageUrl = null;

    //SAVING IMAGE LOGIC
    if (status === "flagged" || status === "success") {
      console.log(`[${Date.now() - startTime}ms] Saving image to storage...`);

      const savedImage = await saveImageLogic(userId, imageBuffer);

      console.log(
        `[${Date.now() - startTime}ms] Image saved. ID: ${savedImage.id}. Updating transaction...`,
      );
      await updateTransactionImage(transaction.id, savedImage.id);
      imageUrl = savedImage.photoUrl;
      transaction = await getTransactionWithCondition(transaction.id);
      console.log("Image URL: ", imageUrl);
    }

    if (status === "flagged") {
      //check if condition has severe on its name (for mild conditions with severe severity)
      const isSevere = transaction.condition_name?.endsWith("-severe");

      //if condition is not flagged but is severe, show the results but no recommendations
      if (isSevere) {
        console.log(
          `[${Date.now() - startTime}ms] Result: FLAGGED (Severe - consult required)`,
        );
        return {
          statusCode: 200,
          payload: {
            result: "consult",
            message:
              "This condition may require professional dermatological care.",
            data: {
              condition_name: transaction.condition_name,
              confidenceScores: transaction.confidenceScores,
              image_url: imageUrl,
            },
          },
        };
      }
      // normal flagged condition flagging
      console.log(
        `[${Date.now() - startTime}ms] Result: FLAGGED (Medical concern)`,
      );
      return {
        statusCode: 200,
        payload: {
          result: "flagged",
          message: "This concern may require professional consultation.",
        },
      };
    }

    if (status === "out of scope") {
      console.log(
        `[${Date.now() - startTime}ms] Result: OUT_OF_SCOPE (Non-skin detected)`,
      );
      return {
        statusCode: 200,
        payload: {
          result: "failed",
          message: "The image does not contain skin or a valid skin region.",
        },
      };
    }

    console.log(
      `[${Date.now() - startTime}ms] >>> ANALYSIS COMPLETE. Total Time: ${Date.now() - startTime}ms\n`,
    );

    return {
      statusCode: 200,
      payload: {
        result: "success",
        message: "Analysis complete",
        data: {
          id: transaction.id,
          userId: transaction.userId,
          imageId: transaction.imageId,
          conditionId: transaction.conditionId,
          confidenceScores: transaction.confidenceScores,
          status: transaction.status,
          condition_name: transaction.condition_name,
          canRecommend: transaction.canRecommend,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
          image_url: imageUrl,
          candidates: skinResult.candidates,
        },
      },
    };
  } catch (err) {
    console.error("FATAL ERROR in analyzeSkin:", err);
    return {
      statusCode: 500,
      payload: { error: "Internal Server Error" },
    };
  }
}

//===== HELPER FUNCTION ==========================
async function saveImageLogic(userId, imageBuffer) {
  const fileName = `skin-${userId}-${Date.now()}.jpg`;
  const photoUrl = await uploadToImageKit(
    imageBuffer,
    fileName,
    "/skin-analysis",
  );
  return await createStoredImage(userId, photoUrl);
}

async function updateTransactionImage(transactionId, imageId) {
  await db
    .update(skinAnalysis)
    .set({ imageId })
    .where(eq(skinAnalysis.id, transactionId));
}
