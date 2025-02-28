import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Get all orders with user and product details
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await storage.getOrders();
    
    // Get details for each order
    const ordersWithDetails = await Promise.all(orders.map(async (order) => {
      const user = await storage.getUser(order.userId);
      const items = await storage.getOrderItems(order.id);
      
      // Get product details for each item
      const products = await Promise.all(items.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          id: product?.id,
          name: product?.name,
          price: item.price,
          quantity: item.quantity
        };
      }));
      
      return {
        id: order.id,
        user: {
          id: user?.id,
          username: user?.username
        },
        products,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      };
    }));
    
    res.status(200).json({
      success: true,
      count: ordersWithDetails.length,
      data: ordersWithDetails
    });
  } catch (error) {
    next(error);
  }
};

// Get single order by ID
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Commande avec l'ID ${id} non trouvée`
      });
    }
    
    // Get user and items
    const user = await storage.getUser(order.userId);
    const items = await storage.getOrderItems(order.id);
    
    // Get product details for each item
    const products = await Promise.all(items.map(async (item) => {
      const product = await storage.getProduct(item.productId);
      return {
        id: product?.id,
        name: product?.name,
        price: item.price,
        quantity: item.quantity
      };
    }));
    
    const orderWithDetails = {
      id: order.id,
      user: {
        id: user?.id,
        username: user?.username
      },
      products,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt
    };
    
    res.status(200).json({
      success: true,
      data: orderWithDetails
    });
  } catch (error) {
    next(error);
  }
};

// Create new order
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, products } = req.body;
    
    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Utilisateur avec l'ID ${userId} non trouvé`
      });
    }
    
    // Validate and get product details
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of products) {
      const product = await storage.getProduct(item.id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Produit avec l'ID ${item.id} non trouvé`
        });
      }
      
      if (!product.inStock) {
        return res.status(400).json({
          success: false,
          error: `Produit ${product.name} n'est pas en stock`
        });
      }
      
      const quantity = item.quantity || 1;
      const itemTotal = product.price * quantity;
      totalAmount += parseFloat(itemTotal.toString());
      
      orderItems.push({
        productId: product.id,
        quantity,
        price: product.price
      });
    }
    
    // Create order
    const newOrder = await storage.createOrder({
      userId,
      totalAmount,
      status: 'pending'
    }, orderItems);
    
    // Get complete order details for response
    const items = await storage.getOrderItems(newOrder.id);
    
    const productsWithDetails = await Promise.all(items.map(async (item) => {
      const product = await storage.getProduct(item.productId);
      return {
        id: product?.id,
        name: product?.name,
        price: item.price,
        quantity: item.quantity
      };
    }));
    
    const orderWithDetails = {
      id: newOrder.id,
      user: {
        id: user.id,
        username: user.username
      },
      products: productsWithDetails,
      totalAmount: newOrder.totalAmount,
      status: newOrder.status,
      createdAt: newOrder.createdAt
    };
    
    res.status(201).json({
      success: true,
      data: orderWithDetails
    });
  } catch (error) {
    next(error);
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    // Check if order exists
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Commande avec l'ID ${id} non trouvée`
      });
    }
    
    // Update order status
    const updatedOrder = await storage.updateOrderStatus(id, status);
    
    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// Delete order
export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if order exists
    const order = await storage.getOrder(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Commande avec l'ID ${id} non trouvée`
      });
    }
    
    await storage.deleteOrder(id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
