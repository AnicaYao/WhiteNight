"use strict";

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

// check the config file
const config = require("./config.json");
if (config && typeof config.projectId !== "undefined") {
  console.log("Project ID: " + config.projectId);
} else {
  throw new Error(
    'Error in config. Make sure to create a config.json file with { "projectId": "YOUR_PROJECT_ID", "bucketId": "YOUR_BUCKET_ID" }'
  );
}

const Storage = require("@google-cloud/storage");
const storage = new Storage(config);

// Cache last `maxCacheEntries` drawing requests.
const drawingCache = new Map();
const maxCacheEntries = 100;

app.get("/", (req, res, next) => {
  const url = "https://github.com/osteele/quickdraw-api-server";
  res.send(`See <a href="${url}">${url}</a>`);
});

/**
 * '/drawing/:category'
 * Method: GET
 * Description: Gets the data for a random drawing
 * @param: {String} category [the name of the Quick, Draw! category (i.e. "cat")]
 */
app.get("/drawing/:category", async (req, res, next) => {
  const category = req.params.category;
  const bucketDirectory = "full/simplified";

  let drawings = drawingCache.get(category);
  if (!drawings) {
    console.log("Fetching bucket data for", category);
    drawings = await storage
      .bucket(config.bucketId)
      .file(`${bucketDirectory}/${category}.ndjson`)
      .download()
      .then((results) => results[0].toString().split("\n"))
      .catch((err) => {
        console.error(err);
        res.send(err);
      });
    drawingCache.set(category, drawings);

    const keys = Array.from(drawingCache.keys());
    if (keys.length > maxCacheEntries) {
      const oldestKey = keys[0];
      console.log("Removing cache for", oldestKey);
      drawingCache.delete(oldestKey);
    }
  }

  const index = Math.floor(Math.random() * drawings.length);
  const drawing = drawings[index];
  res.send(drawing);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
