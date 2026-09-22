const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const opts = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'SmartDesk AI API', version: '1.0.0', description: 'Helpdesk + RAG + Triage' },
    servers: [{ url: 'http://localhost:5000' }],
    components: { securitySchemes: { cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' } } },
  },
  apis: ['./src/routes/*.js'],
};
const spec = swaggerJsdoc(opts);
function mount(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
  app.get('/api/docs.json', (_req, res) => res.json(spec));
}
module.exports = mount;
