const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
// const qrcode = require("qrcode");
const { exec } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const wwebVersion = "2.2412.54"; // WhatsApp Web version

// Path to your Python script
const pythonScriptPath = path.join(__dirname, "predict.py");
// const pythonScriptPath = path.join(__dirname, "test.py");

// Path to the Python executable in the Conda environment
const pythonExecutablePath =
  "C:\\Users\\FIRZY\\anaconda3\\envs\\tf_env\\python.exe"; // Adjust for your environment

// Get Puppeteer executable path
const executablePath = puppeteer.executablePath();

// WhatsApp client setup
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
    devtools: false,
    timeout: 60000, // Increase the timeout to 60 seconds
  },
  // Locking the wweb version
  webVersionCache: {
    type: "remote",
    remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
  },
});

// client.on("qr", (qr) => {
//   qrcode.toString(qr, { type: "terminal", small: true }, (err, url) => {
//     if (err) {
//       console.error("Error generating QR code:", err);
//     } else {
//       console.log(url);
//     }
//   });
// });

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR RECEIVED: ", qr);
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("authenticated", (session) => {
  console.log("AUTHENTICATED");
  console.log("Session:", session);
  if (!session) {
    console.error("Session is undefined");
  } else {
    console.log("Session details:", JSON.stringify(session, null, 2));
  }
});

client.on("auth_failure", (msg) => {
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
});

client.on("message", async (message) => {
  // Filter messages by type and sender
  if (message.type === "chat" && message.from !== "status@broadcast") {
    console.log("\nReceived message:", message.body);

    // Sanitize message to handle multi-line inputs
    const messageText = message.body.replace(/\n/g, " ");
    const escapedMessageText = messageText.replace(/"/g, '\\"'); // Escape any double quotes in the message text

    const startTime = new Date();

    exec(
      `${pythonExecutablePath} "${pythonScriptPath}" "${escapedMessageText}" 2>NUL`,
      (error, stdout, stderr) => {
        const endTime = new Date();
        const executionTime = (endTime - startTime) / 1000; // Execution time in seconds

        if (error) {
          console.error(`Error executing script: ${error}`);
          return;
        }
        if (stderr) {
          console.error(`Script error: ${stderr}`);
        }
        console.log(`Prediction result: ${stdout.trim()}`);
        console.log(`Execution time: ${executionTime} seconds`);
      }
    );
  }
});

// Initialize client with retry mechanism
const initializeClient = async (retries = 3) => {
  try {
    await client.initialize();
  } catch (err) {
    if (retries === 0) {
      console.error("Client initialization failed after retries", err);
      return;
    }
    console.warn(
      `Client initialization failed. Retrying... (${retries} retries left)`,
      err
    );
    setTimeout(() => initializeClient(retries - 1), 5000);
  }
};

initializeClient();

// ---------------------------------------------------------------------------------
// ----------------------------- using tfjs (old) -------------------------------------------

// const { Client, LocalAuth } = require("whatsapp-web.js");
// const qrcode = require("qrcode-terminal");
// const tf = require("@tensorflow/tfjs-node");
// const fs = require("fs");
// const path = require("path");

// const wwebVersion = "2.2412.54"; // WhatsApp Web version

// // Load the TensorFlow.js model
// const loadModel = async () => {
//   const modelPath =
//     "file://C:/Users/FIRZY/OneDrive - UNIVERSITAS INDONESIA/Documents/Kuliah1/Semester 8/Skripsi/Model/110624 (2)/model.json";
//   const model = await tf.loadLayersModel(modelPath);
//   return model;
// };

// // Load the tokenizer from the saved JSON file
// const loadTokenizer = () => {
//   const tokenizerPath = "C:/patokenizerConfig.num_words;
//   tokenizer.filters = th/to/your/tokenizer_config.json";
//   const tokenizerData = fs.readFileSync(tokenizerPath, "utf8");
//   const tokenizerConfig = JSON.parse(tokenizerData);

//   const tokenizer = new tf.Tokenizer();
//   tokenizer.word_index = tokenizerConfig.word_index;
//   tokenizer.num_words = tokenizerConfig.filters;
//   tokenizer.lower = tokenizerConfig.lower;
//   tokenizer.split = tokenizerConfig.split;
//   tokenizer.char_level = tokenizerConfig.char_level;
//   tokenizer.oov_token = tokenizerConfig.oov_token;

//   return tokenizer;
// };

// // Preprocess the message using the tokenizer
// const preprocessMessage = (message, tokenizer, maxLen) => {
//   const sequences = tokenizer.texts_to_sequences([message]);
//   const padded = tf.padSequences(sequences, {
//     maxlen: maxLen,
//     padding: "post",
//   });
//   return padded;
// };

// // Classification function
// const classifyMessage = async (model, tokenizer, maxLen, message) => {
//   const preprocessedMessage = preprocessMessage(message, tokenizer, maxLen);
//   const predictions = model.predict(preprocessedMessage);
//   const results = predictions.arraySync()[0]; // Get the first prediction result

//   const labels = ["spam", "promo", "normal"];
//   const maxIndex = results.indexOf(Math.max(...results));
//   return labels[maxIndex];
// };

// // WhatsApp client setup
// const client = new Client({
//   authStrategy: new LocalAuth(), // Use default settings for LocalAuth
//   puppeteer: {
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   },
//   // Locking the wweb version
//   webVersionCache: {
//     type: "remote",
//     remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
//   },
// });

// client.on("qr", (qr) => {
//   qrcode.generate(qr, { small: true });
//   console.log("QR RECEIVED", qr);
// });

// client.on("ready", () => {
//   console.log("Client is ready!");
// });

// client.on("authenticated", (session) => {
//   console.log("AUTHENTICATED", session);
// });

// client.on("auth_failure", (msg) => {
//   console.error("AUTHENTICATION FAILURE", msg);
// });

// client.on("disconnected", (reason) => {
//   console.log("Client was logged out", reason);
// });

// client.on("message", async (message) => {
//   // Filter messages by type and sender
//   if (message.type === "chat" && message.from !== "status@broadcast") {
//     console.log("Received message:", message.body);

//     // Load model and tokenizer
//     const model = await loadModel();
//     const tokenizer = loadTokenizer();
//     const maxLen = 46; // Updated max_len from your training script

//     // Classify the message
//     const classification = await classifyMessage(
//       model,
//       tokenizer,
//       maxLen,
//       message.body
//     );

//     // Respond based on classification
//     switch (classification) {
//       case "spam":
//         message.reply("This message is classified as spam.");
//         break;
//       case "promo":
//         message.reply("This message is classified as a promotional message.");
//         break;
//       case "normal":
//         message.reply("This message is classified as a normal message.");
//         break;
//       default:
//         message.reply("Unable to classify this message.");
//         break;
//     }
//   }
// });

// client.initialize().catch((err) => {
//   console.error("Client initialization failed", err);
// });

// ---------------------------------------------------------------------------------------------------

// const { Client, LocalAuth } = require("whatsapp-web.js");
// const qrcode = require("qrcode-terminal");
// const tf = require("@tensorflow/tfjs-node");
// const fs = require("fs");
// const path = require("path");

// const wwebVersion = "2.2412.54"; // WhatsApp Web version

// // Load the LSTM model
// const loadModel = async () => {
//   const modelPath = "file://C:/Users/FIRZY/OneDrive - UNIVERSITAS INDONESIA/Documents/Kuliah1/Semester 8/Skripsi/Model/110624/tfjs_model/model.json";
//   const model = await tf.loadLayersModel(modelPath);
//   return model;
// };

// // Load the tokenizer from the saved JSON file
// const loadTokenizer = () => {
//   const tokenizerPath =
//     "C:/Users/FIRZY/OneDrive - UNIVERSITAS INDONESIA/Documents/Kuliah1/Semester 8/Skripsi/API/tokenizer_config.json";
//   const tokenizerData = fs.readFileSync(tokenizerPath, "utf8");
//   const tokenizerConfig = JSON.parse(tokenizerData);

//   const tokenizer = new tf.Tokenizer();
//   tokenizer.word_index = tokenizerConfig.word_index;
//   tokenizer.num_words = tokenizerConfig.num_words;
//   tokenizer.filters = tokenizerConfig.filters;
//   tokenizer.lower = tokenizerConfig.lower;
//   tokenizer.split = tokenizerConfig.split;
//   tokenizer.char_level = tokenizerConfig.char_level;
//   tokenizer.oov_token = tokenizerConfig.oov_token;

//   return tokenizer;
// };

// // Preprocess the message using the tokenizer
// const preprocessMessage = (message, tokenizer, maxLen) => {
//   const sequences = tokenizer.texts_to_sequences([message]);
//   const padded = tf.padSequences(sequences, {
//     maxlen: maxLen,
//     padding: "post",
//   });
//   return padded;
// };

// // Classification function
// const classifyMessage = async (model, tokenizer, maxLen, message) => {
//   const preprocessedMessage = preprocessMessage(message, tokenizer, maxLen);
//   const predictions = model.predict(preprocessedMessage);
//   const results = predictions.arraySync()[0]; // Get the first prediction result

//   const labels = ["spam", "promo", "normal"];
//   const maxIndex = results.indexOf(Math.max(...results));
//   return labels[maxIndex];
// };

// // WhatsApp client setup
// const client = new Client({
//   authStrategy: new LocalAuth(), // Use default settings for LocalAuth
//   puppeteer: {
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   },
//   // Locking the wweb version
//   webVersionCache: {
//     type: "remote",
//     remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
//   },
// });

// client.on("qr", (qr) => {
//   qrcode.generate(qr, { small: true });
//   console.log("QR RECEIVED", qr);
// });

// client.on("ready", () => {
//   console.log("Client is ready!");
// });

// client.on("authenticated", (session) => {
//   console.log("AUTHENTICATED", session);
// });

// client.on("auth_failure", (msg) => {
//   console.error("AUTHENTICATION FAILURE", msg);
// });

// client.on("disconnected", (reason) => {
//   console.log("Client was logged out", reason);
// });

// client.on("message", async (message) => {
//   // Filter messages by type and sender
//   if (message.type === "chat" && message.from !== "status@broadcast") {
//     console.log("Received message:", message.body);

//     // Load model and tokenizer
//     const model = await loadModel();
//     const tokenizer = loadTokenizer();
//     const maxLen = 46; // Updated max_len from your training script

//     // Classify the message
//     const classification = await classifyMessage(
//       model,
//       tokenizer,
//       maxLen,
//       message.body
//     );

//     // Respond based on classification
//     switch (classification) {
//       case "spam":
//         message.reply("This message is classified as spam.");
//         break;
//       case "promo":
//         message.reply("This message is classified as a promotional message.");
//         break;
//       case "normal":
//         message.reply("This message is classified as a normal message.");
//         break;
//       default:
//         message.reply("Unable to classify this message.");
//         break;
//     }
//   }
// });

// client.initialize().catch((err) => {
//   console.error("Client initialization failed", err);
// });

//----------------------------------------------------------------------------------------------

// const { Client, LocalAuth } = require("whatsapp-web.js");
// const qrcode = require("qrcode-terminal");
// const tf = require("@tensorflow/tfjs-node");
// const fs = require("fs");
// const path = require("path");

// // Load the LSTM model
// const loadModel = async () => {
//   const model = await tf.loadLayersModel(
//     "file://C:/Users/FIRZY/OneDrive - UNIVERSITAS INDONESIA/Documents/Kuliah1/Semester 8/Skripsi/Model/best_model.h5/model.json"
//   );
//   return model;
// };

// // Load the tokenizer from the saved JSON file
// const loadTokenizer = () => {
//   const tokenizerPath =
//     "C:/Users/FIRZY/OneDrive - UNIVERSITAS INDONESIA/Documents/Kuliah1/Semester 8/Skripsi/API/tokenizer_config.json";
//   const tokenizerData = fs.readFileSync(tokenizerPath, "utf8");
//   const tokenizerConfig = JSON.parse(tokenizerData);

//   const tokenizer = new tf.Tokenizer();
//   tokenizer.word_index = tokenizerConfig.word_index;
//   tokenizer.num_words = tokenizerConfig.num_words;
//   tokenizer.filters = tokenizerConfig.filters;
//   tokenizer.lower = tokenizerConfig.lower;
//   tokenizer.split = tokenizerConfig.split;
//   tokenizer.char_level = tokenizerConfig.char_level;
//   tokenizer.oov_token = tokenizerConfig.oov_token;

//   return tokenizer;
// };

// // Preprocess the message using the tokenizer
// const preprocessMessage = (message, tokenizer, maxLen) => {
//   // Tokenize and pad the message
//   const sequences = tokenizer.texts_to_sequences([message]);
//   const padded = tf.padSequences(sequences, {
//     maxlen: maxLen,
//     padding: "post",
//   });
//   return padded;
// };

// // Classification function
// const classifyMessage = async (model, tokenizer, maxLen, message) => {
//   const preprocessedMessage = preprocessMessage(message, tokenizer, maxLen);
//   const predictions = model.predict(preprocessedMessage);
//   const results = predictions.arraySync();
//   const labels = ["spam", "promo", "normal"];
//   return labels[results.indexOf(Math.max(...results))];
// };

// // WhatsApp client setup
// const client = new Client({
//   authStrategy: new LocalAuth(),
// });

// client.on("qr", (qr) => {
//   qrcode.generate(qr, { small: true });
//   console.log("QR RECEIVED", qr);
// });

// client.on("ready", () => {
//   console.log("Client is ready!");
// });

// client.on("message", async (message) => {
//   console.log("Received message:", message.body);

//   // Load model and tokenizer
//   const model = await loadModel();
//   const tokenizer = loadTokenizer();
//   const maxLen = 46; // Updated max_len from your training script

//   // Classify the message
//   const classification = await classifyMessage(
//     model,
//     tokenizer,
//     maxLen,
//     message.body
//   );

//   // Respond based on classification
//   switch (classification) {
//     case "spam":
//       message.reply("This message is classified as spam.");
//       break;
//     case "promo":
//       message.reply("This message is classified as a promotional message.");
//       break;
//     case "normal":
//       message.reply("This message is classified as a normal message.");
//       break;
//     default:
//       message.reply("Unable to classify this message.");
//       break;
//   }
// });

// client.initialize();

// ----------------------------------------------------------------------------------------------

// const { Client } = require("whatsapp-web.js");
// const qrcode = require("qrcode-terminal");

// const client = new Client({
//   webVersionCache: {
//     type: "remote",
//     remotePath:
//       "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
//   },
// });

// client.on("ready", () => {
//   console.log("Client is ready!");
// });

// client.on("qr", (qr) => {
//   qrcode.generate(qr, { small: true });
// });

// client.initialize();

// // Listening to all incoming messages
// client.on("message_create", (message) => {
//   if (message.type === "chat" && message.from !== "status@broadcast") {
//     console.log(message.body);
//   }
// });

// client.on("message_create", (message) => {
//   if (message.body === "!ping") {
//     // send back "pong" to the chat the message was sent in
//     client.sendMessage(message.from, "pong");
//   }
// });
