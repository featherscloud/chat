import {createContext, useContext} from "react";
import {DocHandle} from "@automerge/automerge-repo";
import {ChatDocument, User} from "../utils.ts";

export type ChatContextValue = {handle: DocHandle<ChatDocument> | null; user: User | null};

export const ChatContext = createContext<ChatContextValue>({handle: null, user: null});

export const useChat = ()=>useContext(ChatContext);
