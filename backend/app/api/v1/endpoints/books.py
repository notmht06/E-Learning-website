"""
Books Catalog and Fidibo/Taaghche E-Reader Endpoints.
"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.schemas.book import (
    BookDetailSchema,
    SampleReadingResponse,
)
from backend.app.services.book_service import book_service
from backend.app.models.database import get_db

router = APIRouter()


@router.get("/", response_model=List[BookDetailSchema], summary="List all books and publications")
async def list_books(db: AsyncSession = Depends(get_db)):
    """
    Retrieves published books, monographs, and critical editions with publication metadata from database.
    """
    return await book_service.get_all_books_async(db=db)


@router.get("/{book_id}", response_model=BookDetailSchema, summary="Get book details by ID")
async def get_book(book_id: str, db: AsyncSession = Depends(get_db)):
    """
    Fetches full book description, table of contents, ISBN, and pricing from database.
    """
    try:
        return await book_service.get_book_by_id_async(book_id, db=db)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{book_id}/sample", response_model=SampleReadingResponse, summary="Get e-reader sample reading pages")
async def get_book_sample(book_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns introductory sample pages and chapters formatted for the browser e-reader component.
    """
    try:
        return await book_service.get_book_sample_async(book_id, db=db)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
