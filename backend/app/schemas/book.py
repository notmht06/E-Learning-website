"""
Book catalog, Taaghche/Fidibo style e-reader samples Pydantic models.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class BookChapterTOC(BaseModel):
    id: int = Field(..., example=1)
    title: str = Field(..., example="Chapter 1: The Primacy of Light in Illuminationism")
    page_number: int = Field(..., example=15)


class SamplePageSpread(BaseModel):
    page_number: int = Field(..., example=1)
    title: str = Field(..., example="Frontispiece & Introduction")
    excerpt: str = Field(..., example="In the name of the Source of all Lights...")
    is_locked: bool = Field(False, example=False)


class BookDetailSchema(BaseModel):
    id: str = Field(..., example="book-ishraq-1")
    title: str = Field(..., example="Hermeneutics of Light: Exposition of Suhrawardi")
    subtitle: str = Field(..., example="Critical Text & Philosophical Annotations")
    author: str = Field(..., example="Dr. Meysam Zanjirzan Hosseini")
    publisher: str = Field(..., example="Hikmat & Falsafa Publications")
    print_edition: str = Field(..., example="3rd Edition (Hardcover)")
    pages_count: int = Field(..., example=480)
    isbn: str = Field(..., example="978-600-1234-56-7")
    price: str = Field(..., example="320,000")
    physical_price: str = Field(..., example="390,000")
    format: str = Field(..., example="Digital & Hardcover Print")
    cover_image: str = Field(..., example="/images/book_cover_real.jpg")
    sample_pdf_url: str = Field(..., example="/sample-books/ishraq-sample.pdf")
    fidibo_reader_url: str = Field(..., example="/reader/book-ishraq-1")
    synopsis: str = Field(..., example="A definitive contemporary study of the metaphysics of light...")
    table_of_contents: List[BookChapterTOC] = Field(default_factory=list)
    sample_reading: List[SamplePageSpread] = Field(default_factory=list)


class BookListResponse(BaseModel):
    total: int = Field(..., example=3)
    items: List[BookDetailSchema]


class SampleReadingResponse(BaseModel):
    book_id: str
    title: str
    total_pages: int
    sample_pages: List[SamplePageSpread]
    table_of_contents: List[BookChapterTOC]
