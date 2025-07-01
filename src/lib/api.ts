import { NextResponse } from "next/server";

export const handleApiError = (error: any, context: string) => {
  console.error(`Error ${context}: ${error}`);
  return NextResponse.json({ error: error.message }, { status: 500 });
};

export const createSuccessResponse = (data: any, status: number = 200) => {
  return NextResponse.json(data, { status });
};

export const validateRequired = (fields: Record<string, any>) => {
  const missing = Object.entries(fields)
    .filter(
      ([key, value]) =>
        !value || (typeof value === "string" && value.trim() === "")
    )
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
};

// Constants for consistent API behavior
export const DEFAULT_RECIPE_LIMIT = 1000;
export const DEFAULT_API_TIMEOUT = 30000;
