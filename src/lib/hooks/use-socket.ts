import { useContext } from "react";
import { IOContext } from "../providers/socket";

export const useSocket = () => useContext(IOContext);
