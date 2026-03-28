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
export enum Role {
    agent = "agent",
    user = "user"
}
export interface backendInterface {
    addMessage(sessionId: SessionId, role: Role, content: string): Promise<boolean>;
    addUserMessageWithResponse(sessionId: SessionId, userContent: string): Promise<string>;
    clearSession(sessionId: SessionId): Promise<boolean>;
    createSession(): Promise<SessionId>;
    getSessionMessages(sessionId: SessionId): Promise<Array<Message>>;
}
