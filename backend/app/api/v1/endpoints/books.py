"""
Books Catalog and Fidibo/Taaghche E-Reader Endpoints.
"""
from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.schemas.book import (
    BookDetailSchema,
    SampleReadingResponse,
)
from backend.app.services.book_service import book_service

router = APIRouter()


@router.get("/", response_model=List[BookDetailSchema], summary="List all books and publications")
def list_books():
    """
    Retrieves published books, monographs, and critical editions with publication metadata.
    """
    return book_service.get_all_books()


@router.get("/{book_id}", response_model=BookDetailSchema, summary="Get book details by ID")
def get_book(book_id: str):
    """
    Fetches full book description, table of contents, ISBN, and pricing.
    """
    try:
        return book_service.get_book_by_id(book_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{book_id}/sample", response_model=SampleReadingResponse, summary="Get e-reader sample reading pages")
def get_book_sample(book_id: str):
    """
    Returns introductory sample pages and chapters formatted for the browser e-reader component.
    """
    try:
        return book_service.get_book_sample(book_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
