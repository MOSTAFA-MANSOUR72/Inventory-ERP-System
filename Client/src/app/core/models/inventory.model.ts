export interface InventoryProduct {
  _id: string;
  product: {
    _id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    category?: string | { _id: string; name: string };
  };
  quantity: number;
  sellPrice: number;
  buyPrice: number;
  branch: string | { _id: string; name: string; location?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryListResponse {
  status: string;
  results: number;
  total: number;
  page: number;
  pages: number;
  data: { inventoryProducts: InventoryProduct[] };
}
