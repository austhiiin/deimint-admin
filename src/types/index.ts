import { z } from "zod";

export type CommissionStatus = "queued" | "sketching" | "painting" | "completed" | "cancelled";

export interface Commission {
  id: string;
  client_name: string;
  client_email: string | null;
  status: CommissionStatus;
  queue_pos: number;
  preview_url: string | null;
  notes: string | null;
  price: number | null;
  medium: string | null;
  created_at: string;
  updated_at: string;
}

export const STATUS_STEPS: CommissionStatus[] = ["queued", "sketching", "painting", "completed"];

export const STATUS_LABELS: Record<CommissionStatus, string> = {
  queued:    "In Queue",
  sketching: "Sketching",
  painting:  "Painting",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_COLORS: Record<CommissionStatus, string> = {
  queued:    "#8367c7",
  sketching: "#f59e0b",
  painting:  "#3b82f6",
  completed: "#10b981",
  cancelled: "#ef4444",
};

export interface GalleryItem {
  id: string;
  title: string;
  medium: string;
  year: number;
  image_url: string;
  alt_text: string;
  description: string | null;
  featured: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  medium: string | null;
  budget: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string | null;
  updated_at: string;
}

export const commissionFormSchema = z.object({
  client_name:  z.string().min(1, "Name required"),
  client_email: z.string().email("Valid email required").or(z.literal("")),
  status:       z.enum(["queued","sketching","painting","completed","cancelled"]),
  queue_pos:    z.number().int().min(0),
  medium:       z.string().optional(),
  price:        z.number().min(0).optional().nullable(),
  notes:        z.string().optional(),
  preview_url:  z.string().url().optional().or(z.literal("")).nullable(),
});
export type CommissionFormData = z.infer<typeof commissionFormSchema>;