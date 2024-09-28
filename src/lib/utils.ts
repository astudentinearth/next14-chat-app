import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const isAlphanumeric = (str: string) => /^[a-zA-Z0-9_]+$/.test(str);
