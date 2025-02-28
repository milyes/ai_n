import { 
  User, InsertUser, 
  Product, InsertProduct, 
  Order, InsertOrder, 
  OrderItem, InsertOrderItem
} from "@shared/schema";

// Define the interface with all CRUD methods needed
export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order methods
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  
  // Order item methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private userIdCounter: number;
  private productIdCounter: number;
  private orderIdCounter: number;
  private orderItemIdCounter: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.userIdCounter = 1;
    this.productIdCounter = 1;
    this.orderIdCounter = 1;
    this.orderItemIdCounter = 1;
    
    // Add some initial data
    this.seedInitialData();
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    // Ensure role has a default value if not provided
    const role = insertUser.role || "user";
    const user: User = { ...insertUser, id, createdAt, role };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const createdAt = new Date();
    // Ensure required fields have default values
    const description = insertProduct.description ?? null;
    const inStock = insertProduct.inStock ?? true;
    // Convert price to string if it's a number
    const price = typeof insertProduct.price === 'number' ? String(insertProduct.price) : insertProduct.price;
    
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt, 
      description, 
      inStock,
      price
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderIdCounter++;
    const createdAt = new Date();
    // Ensure status has a default value
    const status = insertOrder.status || "pending";
    // Convert totalAmount to string if it's a number
    const totalAmount = typeof insertOrder.totalAmount === 'number' ? String(insertOrder.totalAmount) : insertOrder.totalAmount;
    
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt, 
      status,
      totalAmount
    };
    this.orders.set(id, order);
    
    // Create order items
    items.forEach(item => {
      const itemId = this.orderItemIdCounter++;
      // Ensure quantity has a default value
      const quantity = item.quantity || 1;
      // Convert price to string if it's a number
      const price = typeof item.price === 'number' ? String(item.price) : item.price;
      
      const orderItem: OrderItem = { 
        ...item, 
        id: itemId, 
        orderId: id,
        quantity,
        price
      };
      this.orderItems.set(itemId, orderItem);
    });
    
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<boolean> {
    // Delete associated order items first
    const orderItemsToDelete = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id);
      
    orderItemsToDelete.forEach(item => {
      this.orderItems.delete(item.id);
    });
    
    return this.orders.delete(id);
  }

  // Order item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }
  
  // Seed initial data
  private seedInitialData() {
    // Create some users
    this.createUser({
      username: "jean_dupont",
      email: "jean@example.com",
      password: "password123",
      role: "user"
    });
    
    this.createUser({
      username: "marie_martin",
      email: "marie@example.com",
      password: "password123",
      role: "admin"
    });
    
    // Create some products
    this.createProduct({
      name: "Smartphone XYZ",
      description: "Un smartphone de haute qualité",
      price: "499.99", // Use string for price
      category: "Électronique",
      inStock: true
    });
    
    this.createProduct({
      name: "Ordinateur portable ABC",
      description: "Un ordinateur léger et puissant",
      price: "899.99", // Use string for price
      category: "Informatique",
      inStock: true
    });
  }
}

export const storage = new MemStorage();
