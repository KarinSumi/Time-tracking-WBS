import express from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import path from 'path';

const router = express.Router();

// Resolve absolute path to docs/openapi.yaml
const openapiPath = path.join(__dirname, '../../docs/openapi.yaml');
const swaggerDocument = yaml.load(openapiPath);

// Serve Swagger UI assets and setup
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
