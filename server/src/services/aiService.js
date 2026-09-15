require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const KnowledgeDoc = require('../models/KnowledgeDoc');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function generateText(prompt) {
  const model = genAI.getGenerativeModel({ model: CHAT_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function getEmbedding(text) {
  const model = await genAI.getEmbeddingModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
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
  const allDocs = await KnowledgeDoc.find().select('title content embeddingVector source');
  const queryEmbedding = await getEmbedding(query);
  const scored = allDocs.map((d) => ({
    doc: d,
    score: cosineSimilarity(queryEmbedding, d.embeddingVector)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.doc.content);
}

module.exports = { chunkText, getEmbedding, generateText, processAndStoreKB, vectorSearch };
