"""
Shopping Cart Management Endpoints.
Complies with Clean Architecture, Session Isolation, and Stateless Service principles.
"""
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Header
from backend.app.schemas.cart import CartItemSchema, CartResponse
from backend.app.services.cart_service import cart_service
from backend.app.api.deps import get_optional_user

router = APIRouter()


def _resolve_cart_id(
    user: Optional[Dict[str, Any]] = None,
    session_id: Optional[str] = None,
) -> str:
    """
    Resolves the isolated cart identifier:
    - If user is authenticated -> 'user_<id>'
    - If X-Cart-Session header provided -> 'session_<id>'
    - Otherwise fallback to 'default'
    """
    if user and user.get("id"):
        return f"user_{user['id']}"
    if session_id and session_id.strip():
        return f"session_{session_id.strip()}"
    return "default"


@router.get("/", response_model=CartResponse, summary="View active shopping cart")
def get_cart(
    user: Optional[Dict[str, Any]] = Depends(get_optional_user),
    x_cart_session: Optional[str] = Header(None),
):
    """
    Retrieves all pending courses and books in the user's isolated cart with calculated totals.
    """
    cart_id = _resolve_cart_id(user, x_cart_session)
    return cart_service.get_cart_response(cart_id=cart_id)


@router.post("/add", response_model=CartResponse, summary="Add item to cart")
def add_to_cart(
    item: CartItemSchema,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user),
    x_cart_session: Optional[str] = Header(None),
):
    """
    Adds a course or physical book to the user's isolated active cart.
    """
    cart_id = _resolve_cart_id(user, x_cart_session)
    return cart_service.add_item(item, cart_id=cart_id)


@router.delete("/remove/{item_id}", response_model=CartResponse, summary="Remove item from cart")
def remove_from_cart(
    item_id: str,
    user: Optional[Dict[str, Any]] = Depends(get_optional_user),
    x_cart_session: Optional[str] = Header(None),
):
    """
    Removes an item from the user's isolated cart by its unique item_id.
    """
    cart_id = _resolve_cart_id(user, x_cart_session)
    return cart_service.remove_item(item_id, cart_id=cart_id)


@router.delete("/clear", response_model=CartResponse, summary="Clear all items in cart")
def clear_cart(
    user: Optional[Dict[str, Any]] = Depends(get_optional_user),
    x_cart_session: Optional[str] = Header(None),
):
    """
    Empties the active isolated shopping cart.
    """
    cart_id = _resolve_cart_id(user, x_cart_session)
    return cart_service.clear_cart(cart_id=cart_id)
