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
  
  // Mount the API router to /api path
  app.use('/api', apiRouter);
  
  // Add error handling middleware
  app.use(errorHandler);
  
  const httpServer = createServer(app);
  
  return httpServer;
}
