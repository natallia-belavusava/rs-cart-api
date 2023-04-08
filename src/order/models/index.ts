import { CartItem } from '../../cart/models';

export type Order = OrderRequest & {
  id: string;
  status: string;
};

export type OrderRequest = {
  userId: string;
  cartId: string;
  items: CartItem[];
  payment: {
    type: string;
    address?: any;
    creditCard?: any;
  };
  delivery: {
    type: string;
    address: any;
  };
  comments: string;
  total: number;
};
