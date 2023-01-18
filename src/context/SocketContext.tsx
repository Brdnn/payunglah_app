import { createContext } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");
const SocketContext = createContext(null);

export { socket, SocketContext };