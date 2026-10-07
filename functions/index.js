const { onSchedule } = require("firebase-functions/scheduler");
const { logger } = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

initializeApp();

const db = getFirestore();
const bucket = getStorage().bucket();

exports.cleanupExpiredVoiceMessages = onSchedule(
  {
    schedule: "every 15 minutes",
    timeZone: "Asia/Amman",
    region: "us-central1",
  },
  async () => {
    const now = Timestamp.now();

    const snapshot = await db
      .collectionGroup("messages")
      .where("expiresAt", "<=", now)
      .limit(200)
      .get();

    let deletedMessages = 0;
    let deletedFiles = 0;

    for (const messageDoc of snapshot.docs) {
      const data = messageDoc.data();

      // Only voice messages created by the 2-hour expiration logic.
      if (data.mediaType !== "voice") {
        continue;
      }

      const storagePath =
        typeof data.storagePath === "string" ? data.storagePath : "";

      try {
        if (storagePath) {
          await bucket.file(storagePath).delete({ ignoreNotFound: true });
          deletedFiles++;
        }

        await messageDoc.ref.delete();
        deletedMessages++;
      } catch (error) {
        logger.error("Failed to clean expired voice message", {
          path: messageDoc.ref.path,
          storagePath,
          error: error?.message || String(error),
        });
      }
    }

    logger.info("Expired voice cleanup completed", {
      found: snapshot.size,
      deletedFiles,
      deletedMessages,
    });
  }
);
