import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Get all users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await storage.getUsers();
    
    // Don't return passwords
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.status(200).json({
      success: true,
      count: sanitizedUsers.length,
      data: sanitizedUsers
    });
  } catch (error) {
    next(error);
  }
};

// Get single user by ID
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Utilisateur avec l'ID ${id} non trouvé`
      });
    }
    
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// Create new user
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: `Le nom d'utilisateur ${req.body.username} est déjà utilisé`
      });
    }
    
    const newUser = await storage.createUser(req.body);
    
    // Don't return password
    const { password, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if user exists
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Utilisateur avec l'ID ${id} non trouvé`
      });
    }
    
    // Update user
    const updatedUser = await storage.updateUser(id, req.body);
    
    // Don't return password
    const { password, ...userWithoutPassword } = updatedUser!;
    
    res.status(200).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if user exists
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Utilisateur avec l'ID ${id} non trouvé`
      });
    }
    
    await storage.deleteUser(id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
