const LRU = require('lru-cache') || require('../utils/lru');
let cache;
try { const LRUCache = require('lru-cache').LRUCache || require('lru-cache'); cache = new LRUCache({ max: 200, ttl: 30_000 }); } catch { const map=new Map(); cache={ get:k=>map.get(k), set:(k,v)=>map.set(k,v), delete:k=>map.delete(k), clear:()=>map.clear() }; }
module.exports = cache;
