import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    content: string;
    role: Role;
    timestamp: bigint;
}
export type SessionId = string;
export interface Expense {
    id: string;
    date: string;
    notes: string;
    timestamp: bigint;
    category: string;
    amount: number;
}
export interface UserProfile {
    goalName: string;
    fixedExpenses: number;
    currentSavings: number;
    savingsGoal: number;
    monthlyIncome: number;
}
export enum Role {
    agent = "agent",
    user = "user"
}
export interface backendInterface {
    addExpense(principal: Principal, category: string, amount: number, notes: string, date: string): Promise<Expense>;
    addInventoryItem(sku: string, units: bigint): Promise<boolean>;
    addMessage(sessionId: SessionId, role: Role, content: string): Promise<boolean>;
    addUserMessageWithResponse(sessionId: SessionId, userContent: string): Promise<string>;
    checkInventory(sku: string): Promise<bigint | null>;
    clearSession(sessionId: SessionId): Promise<boolean>;
    createSession(): Promise<SessionId>;
    deleteExpense(principal: Principal, id: string): Promise<boolean>;
    getAllInventory(): Promise<Array<[string, bigint]>>;
    getExpenses(principal: Principal): Promise<Array<Expense>>;
    getProfile(principal: Principal): Promise<UserProfile | null>;
    getSessionMessages(sessionId: SessionId): Promise<Array<Message>>;
    saveProfile(principal: Principal, monthlyIncome: number, fixedExpenses: number, savingsGoal: number, goalName: string, currentSavings: number): Promise<boolean>;
}
