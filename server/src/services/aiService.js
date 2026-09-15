const { GoogleGenerativeAI } = require('@google/generative-ai');
const KnowledgeDoc = require('../models/KnowledgeDoc');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const EMBEDDING_MODEL = 'text-embedding-004';
const CHAT_MODEL = 'gemini-1.5-flash';
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

function chunkText(text) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.substring(start, start + CHUNK_SIZE));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks.length ? chunks : [text];
}

async function getEmbedding(text) {
  const model = await genAI.getEmbeddingModel({ model: EMBEDDING_MODEL });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

async function generateText(prompt) {
  const model = genAI.getGenerativeModel({ model: CHAT_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function processAndStoreKB(title, content, source, uploadedBy) {
  const chunks = chunkText(content);
  const docs = [];
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);
    docs.push({ title, content: chunk, source, uploadedBy, embeddingVector: embedding, chunkCount: chunks.length });
  }
  await KnowledgeDoc.insertMany(docs);
  return { title, chunkCount: chunks.length };
}

async function vectorSearch(query, limit = 3) {
  const queryEmbedding = await getEmbedding(query);
  const pipeline = [
    {
      $vectorSearch: {
        index: 'vector',
        path: 'embeddingVector',
        queryVector: queryEmbedding,
        numCandidates: 10,
        limit
      }
    }
  ];
  const results = await KnowledgeDoc.aggregate(pipeline);
  return results.map((r) => r.content);
}

module.exports = { chunkText, getEmbedding, generateText, processAndStoreKB, vectorSearch };
