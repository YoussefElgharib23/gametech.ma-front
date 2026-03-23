type CartProduct = {
  id: number;
  slug: string;
  title: string;
  image: string | null;
  brand: string | null;
  price: number;
  price_label: string;
};

type CartItem = {
  id: number;
  quantity: number;
  line_total: number;
  line_total_label: string;
  product: CartProduct;
};

type CartPayload = {
  cart: {
    id: number;
    visitor_id: number;
  };
  items: CartItem[];
  totals: {
    items_count: number;
    subtotal: number;
    subtotal_label: string;
    shipping: number;
    shipping_label: string;
    discount: number;
    discount_label: string;
    grand_total: number;
    grand_total_label: string;
  };
};

export default function useCart() {
  const cart = useState<CartPayload | null>("cart", () => null);
  const pending = useState<boolean>("cart_pending", () => false);

  const { authenticateVisitor } = useVisitor();
  const visitorToken = useCookie<string | undefined>("visitor_token");

  const ensureVisitor = async () => {
    if (!visitorToken.value) {
      await authenticateVisitor();
    }
  };

  const run = async (fn: () => Promise<CartPayload>, withPending = true) => {
    if (withPending) pending.value = true;
    try {
      await ensureVisitor();
      cart.value = await fn();
      return cart.value;
    } finally {
      if (withPending) pending.value = false;
    }
  };

  const loadCart = async () =>
    run(() =>
      $apiFetch<CartPayload>("/cart", {
        method: "GET",
        showToast: false,
        withLoading: false,
      }),
    );

  const addItem = async (productId: number, quantity = 1) =>
    run(() =>
      $apiFetch<CartPayload>("/cart/items", {
        method: "POST",
        body: { product_id: productId, quantity },
        withLoading: false,
      }),
    );

  const incrementItem = async (itemId: number) =>
    run(() =>
      $apiFetch<CartPayload>(`/cart/items/${itemId}/increment`, {
        method: "PATCH",
        withLoading: false,
      }),
      false,
    );

  const decrementItem = async (itemId: number) =>
    run(() =>
      $apiFetch<CartPayload>(`/cart/items/${itemId}/decrement`, {
        method: "PATCH",
        withLoading: false,
      }),
      false,
    );

  const removeItem = async (itemId: number) =>
    run(() =>
      $apiFetch<CartPayload>(`/cart/items/${itemId}`, {
        method: "DELETE",
        withLoading: false,
      }),
    );

  const clearCart = async () =>
    run(() =>
      $apiFetch<CartPayload>("/cart/clear", {
        method: "DELETE",
        withLoading: false,
      }),
    );

  const items = computed(() => cart.value?.items ?? []);
  const itemsCount = computed(() => cart.value?.totals.items_count ?? 0);
  const subtotalLabel = computed(() => cart.value?.totals.subtotal_label ?? "0.00");
  const shippingLabel = computed(() => cart.value?.totals.shipping_label ?? "0.00");
  const discountLabel = computed(() => cart.value?.totals.discount_label ?? "0.00");
  const grandTotalLabel = computed(() => cart.value?.totals.grand_total_label ?? "0.00");

  return {
    cart,
    items,
    itemsCount,
    subtotalLabel,
    shippingLabel,
    discountLabel,
    grandTotalLabel,
    pending,
    loadCart,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  };
}
