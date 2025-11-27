export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  permite_mitad: boolean;
  tags?: string[];
}

export interface CartItem {
  product: CatalogProduct;
  quantity: number;
  notes?: string;
}
