"""
Shopping Cart Management Service.
Complies with Clean Architecture and stateless REST principles.
"""
from typing import Dict, Any, List
from backend.app.schemas.cart import CartItemSchema, CartResponse


class CartService:
    def __init__(self):
        # In-memory session-keyed carts dictionary
        self._carts: Dict[str, List[CartItemSchema]] = {
            "default": [
                CartItemSchema(
                    item_id="course-ishraq",
                    item_type="course",
                    title="شرح و تحلیل جامع حکمة‌الاشراق سهروردی",
                    price=890000,
                    quantity=1,
                    cover_image="/images/ostad_zanjirzan.jpg"
                )
            ]
        }

    def _get_cart_items(self, cart_id: str) -> List[CartItemSchema]:
        if cart_id not in self._carts:
            self._carts[cart_id] = []
        return self._carts[cart_id]

    def get_cart_response(self, cart_id: str = "default") -> CartResponse:
        """Calculates totals and returns structured cart response."""
        items = self._get_cart_items(cart_id)
        subtotal = sum(i.price * i.quantity for i in items)
        return CartResponse(
            items=items,
            items_count=len(items),
            subtotal=subtotal,
            discount=0,
            total=subtotal
        )

    def add_item(self, item: CartItemSchema, cart_id: str = "default") -> CartResponse:
        """Adds an item or increments existing item quantity in cart."""
        items = self._get_cart_items(cart_id)
        for existing in items:
            if existing.item_id == item.item_id:
                existing.quantity += item.quantity
                return self.get_cart_response(cart_id)
        items.append(item)
        return self.get_cart_response(cart_id)

    def remove_item(self, item_id: str, cart_id: str = "default") -> CartResponse:
        """Removes an item from the cart."""
        items = self._get_cart_items(cart_id)
        self._carts[cart_id] = [i for i in items if i.item_id != item_id]
        return self.get_cart_response(cart_id)

    def clear_cart(self, cart_id: str = "default") -> CartResponse:
        """Clears all items in the specified cart."""
        self._carts[cart_id] = []
        return self.get_cart_response(cart_id)


cart_service = CartService()
