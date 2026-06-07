export type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

export interface MetaContent {
  id: string;
  quantity: number;
  item_price?: number;
}

export interface MetaCustomData {
  currency?: "USD";
  value?: number;
  content_name?: string;
  content_category?: string;
  content_type?: "product" | "product_group";
  content_ids?: string[];
  contents?: MetaContent[];
  num_items?: number;
  order_id?: string;
}

