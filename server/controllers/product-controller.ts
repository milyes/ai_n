import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Get all products
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await storage.getProducts();
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Get single product by ID
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const product = await storage.getProduct(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Produit avec l'ID ${id} non trouvé`
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Create new product
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newProduct = await storage.createProduct(req.body);
    
    res.status(201).json({
      success: true,
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if product exists
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Produit avec l'ID ${id} non trouvé`
      });
    }
    
    // Update product
    const updatedProduct = await storage.updateProduct(id, req.body);
    
    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if product exists
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Produit avec l'ID ${id} non trouvé`
      });
    }
    
    await storage.deleteProduct(id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
