import { User, InsertUser, ApiKey, VpnConnection } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomBytes } from "crypto";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // API Keys
  createApiKey(userId: number, name: string): Promise<ApiKey>;
  getApiKeys(userId: number): Promise<ApiKey[]>;
  deactivateApiKey(id: number): Promise<void>;
  
  // VPN
  updateVpnStatus(userId: number, status: string, bandwidth?: number): Promise<VpnConnection>;
  getVpnStatus(userId: number): Promise<VpnConnection | undefined>;
  
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apiKeys: Map<number, ApiKey>;
  private vpnConnections: Map<number, VpnConnection>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.apiKeys = new Map();
    this.vpnConnections = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createApiKey(userId: number, name: string): Promise<ApiKey> {
    const id = this.currentId++;
    const key = randomBytes(32).toString('hex');
    const apiKey: ApiKey = {
      id,
      userId,
      key,
      name,
      active: true,
      createdAt: new Date(),
    };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }

  async getApiKeys(userId: number): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).filter(
      (key) => key.userId === userId,
    );
  }

  async deactivateApiKey(id: number): Promise<void> {
    const key = this.apiKeys.get(id);
    if (key) {
      this.apiKeys.set(id, { ...key, active: false });
    }
  }

  async updateVpnStatus(userId: number, status: string, bandwidth?: number): Promise<VpnConnection> {
    const connection: VpnConnection = {
      id: userId,
      userId,
      status,
      bandwidth: bandwidth || 0,
      lastChecked: new Date(),
    };
    this.vpnConnections.set(userId, connection);
    return connection;
  }

  async getVpnStatus(userId: number): Promise<VpnConnection | undefined> {
    return this.vpnConnections.get(userId);
  }
}

export const storage = new MemStorage();
