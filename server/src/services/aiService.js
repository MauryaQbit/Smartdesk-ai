const KnowledgeDoc = require('../models/KnowledgeDoc');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const CHAT_MODEL = 'llama3.1:8b';
const EMBEDDING_MODEL = 'nomic-embed-text';
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

async function ollamaGenerate(prompt, model = CHAT_MODEL) {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0.3 } })
  });
  if (!res.ok) throw new Error(`Ollama generate failed: ${res.status}`);
  const data = await res.json();
  return data.response;
}

async function ollamaEmbedding(text) {
  const res = await fetch(`${OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text })
  });
  if (!res.ok) throw new Error(`Ollama embedding failed: ${res.status}`);
  const data = await res.json();
  return data.embedding;
}

async function generateText(prompt) {
  return ollamaGenerate(prompt);
}

async function getEmbedding(text) {
  return ollamaEmbedding(text);
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
