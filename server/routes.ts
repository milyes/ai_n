import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { validate } from "./middlewares/validate";
import { errorHandler } from "./middlewares/error-handler";
import { 
  userValidationSchema, 
  productValidationSchema, 
  orderValidationSchema 
} from "../shared/schema";
import { z } from "zod";
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from "./controllers/user-controller";
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "./controllers/product-controller";
import { 
  getAllOrders, 
  getOrderById, 
  createOrder, 
  updateOrderStatus, 
  deleteOrder 
} from "./controllers/order-controller";
import {
  analyzeTextSentiment,
  generateSummary,
  getProductRecommendations,
  setDefaultAIOrigin,
  getDefaultAIOrigin
} from "./controllers/ai-controller";
import {
  getServiceStatus,
  startService,
  stopService,
  testService,
  getEmpreintes,
  addEmpreinte,
  deleteEmpreinte,
  getLogs,
  getConfig,
  updateConfig,
  testEmpreinte,
  exportLogs,
  getGroupes,
  createGroupe,
  addUserToGroup,
  removeUserFromGroup,
  getNotifications
} from "./controllers/porte-automatique-controller";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a router for API routes
  const apiRouter = express.Router();
  
  // User routes
  apiRouter.get('/users', getAllUsers);
  apiRouter.get('/users/:id', getUserById);
  apiRouter.post('/users', validate(userValidationSchema), createUser);
  apiRouter.put('/users/:id', validate(userValidationSchema.partial()), updateUser);
  apiRouter.delete('/users/:id', deleteUser);
  
  // Product routes
  apiRouter.get('/products', getAllProducts);
  apiRouter.get('/products/:id', getProductById);
  apiRouter.post('/products', validate(productValidationSchema), createProduct);
  apiRouter.put('/products/:id', validate(productValidationSchema.partial()), updateProduct);
  apiRouter.delete('/products/:id', deleteProduct);
  
  // Order routes
  apiRouter.get('/orders', getAllOrders);
  apiRouter.get('/orders/:id', getOrderById);
  apiRouter.post('/orders', validate(orderValidationSchema), createOrder);
  apiRouter.put('/orders/:id/status', validate(z.object({ status: z.string() })), updateOrderStatus);
  apiRouter.delete('/orders/:id', deleteOrder);
  
  // AI routes
  apiRouter.post('/ai/sentiment', analyzeTextSentiment);
  apiRouter.post('/ai/summary', generateSummary);
  apiRouter.post('/ai/recommendations', getProductRecommendations);
  
  // AI configuration routes
  apiRouter.get('/ai/config/origin', getDefaultAIOrigin);
  apiRouter.post('/ai/config/origin', setDefaultAIOrigin);
  
  // Porte Automatique IA routes
  apiRouter.get('/porte-automatique/status', getServiceStatus);
  apiRouter.post('/porte-automatique/start', startService);
  apiRouter.post('/porte-automatique/stop', stopService);
  apiRouter.post('/porte-automatique/test', testService);
  
  // Empreintes
  apiRouter.get('/porte-automatique/empreintes', getEmpreintes);
  apiRouter.post('/porte-automatique/empreintes', addEmpreinte);
  apiRouter.delete('/porte-automatique/empreintes/:id', deleteEmpreinte);
  apiRouter.post('/porte-automatique/empreintes/test', testEmpreinte);
  
  // Logs
  apiRouter.get('/porte-automatique/logs', getLogs);
  apiRouter.get('/porte-automatique/logs/export', exportLogs);
  
  // Configuration
  apiRouter.get('/porte-automatique/config', getConfig);
  apiRouter.put('/porte-automatique/config', updateConfig);
  
  // Groupes d'accès
  apiRouter.get('/porte-automatique/groupes', getGroupes);
  apiRouter.post('/porte-automatique/groupes', createGroupe);
  apiRouter.post('/porte-automatique/groupes/add-user', addUserToGroup);
  apiRouter.post('/porte-automatique/groupes/remove-user', removeUserFromGroup);
  
  // Notifications
  apiRouter.get('/porte-automatique/notifications', getNotifications);
  
  // Mount the API router to /api path
  app.use('/api', apiRouter);
  
  // Add error handling middleware
  app.use(errorHandler);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
