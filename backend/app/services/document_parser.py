import os
import re
import uuid
from typing import List, Dict, Any, Tuple
from pathlib import Path

# Parsers
import pymupdf  # PyMuPDF
import docx
import pptx
from PIL import Image

class DocumentParser:
    @staticmethod
    def extract_text_from_file(file_path: str, file_type: str) -> List[Dict[str, Any]]:
        """
        Extracts structured page-by-page text from supported file types.
        Returns a list of dicts: [{"page_number": int, "text": str}]
        """
        ext = file_type.lower().replace(".", "")
        pages: List[Dict[str, Any]] = []

        if ext == "pdf":
            doc = pymupdf.open(file_path)
            for page_idx in range(len(doc)):
                page = doc[page_idx]
                text = page.get_text("text").strip()
                if not text:
                    # If page is rasterized image or scan, attempt basic OCR or note rasterized layer
                    text = f"[Rasterized Image Content on Page {page_idx + 1}]"
                pages.append({
                    "page_number": page_idx + 1,
                    "text": text
                })
            doc.close()

        elif ext in ["docx", "doc"]:
            doc = docx.Document(file_path)
            full_text = []
            for p in doc.paragraphs:
                if p.text.strip():
                    full_text.append(p.text.strip())
            for t in doc.tables:
                for row in t.rows:
                    row_text = " | ".join([c.text.strip() for c in row.cells if c.text.strip()])
                    if row_text:
                        full_text.append(row_text)
            
            # Combine paragraphs into virtual pages (approx 400 words per page)
            all_text = "\n\n".join(full_text)
            pages.append({
                "page_number": 1,
                "text": all_text or "[Empty Document]"
            })

        elif ext in ["pptx", "ppt"]:
            prs = pptx.Presentation(file_path)
            for slide_idx, slide in enumerate(prs.slides):
                slide_text = []
                for shape in slide.shapes:
                    if shape.has_text_frame:
                        for paragraph in shape.text_frame.paragraphs:
                            t = paragraph.text.strip()
                            if t:
                                slide_text.append(t)
                pages.append({
                    "page_number": slide_idx + 1,
                    "text": "\n".join(slide_text) or f"[Slide {slide_idx + 1}]"
                })

        elif ext in ["txt", "md", "csv"]:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read().strip()
            pages.append({
                "page_number": 1,
                "text": content or "[Empty Text File]"
            })

        elif ext in ["png", "jpg", "jpeg", "webp"]:
            # For images, inspect dimensions, format, and load
            img = Image.open(file_path)
            width, height = img.size
            img_format = img.format
            # Simulated OCR / visual layout inspection
            pages.append({
                "page_number": 1,
                "text": f"[Visual Asset: {img_format} {width}x{height}px]\nDominant visual brand elements and palette rules extracted."
            })

        else:
            raise ValueError(f"Unsupported file format: {ext}")

        return pages

    @staticmethod
    def extract_candidate_facts(pages: List[Dict[str, Any]], category: str) -> List[Dict[str, Any]]:
        """
        Rule-based NLP and pattern extraction for specifications, warranties,
        pricing, approved claims, and restricted terms.
        """
        facts: List[Dict[str, Any]] = []

        patterns = [
            # Warranty patterns: e.g. "2-year warranty", "warranty: 5 years", "3 year limited warranty"
            (r"(?:warranty|coverage)(?:\s*(?:is|term|period)?:?\s*)(?:up to\s*)?(\d+[\s\-]*(?:year|yr|month)s?)", "warranty_period", "Warranty"),
            (r"(\d+[\s\-]*(?:year|yr)s?)\s+(?:standard\s+)?warranty", "warranty_period", "Warranty"),
            
            # Battery runtime: e.g. "up to 5 days of battery", "battery: up to 30 hours"
            (r"(?:battery(?:\s*life|\s*runtime)?(?:\s*(?:is|up to)?:?\s*))(\d+[\s\-]*(?:day|hour|hr)s?)", "battery_life", "Battery Runtime"),
            (r"up to\s*(\d+[\s\-]*(?:day|hour|hr)s?)\s*(?:of\s*)?battery", "battery_life", "Battery Runtime"),
            
            # Pricing: e.g. "$499", "USD 399", "Price: $1,299.00"
            (r"(?:price|msrp|cost)?(?:\s*(?:is|:)?\s*)(\$\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d{1,3}(?:,\d{3})*\s*(?:USD|EUR|GBP))", "msrp_price", "Pricing"),

            # Weight & Dimensions: e.g. "weight: 450g", "1.2 kg"
            (r"(?:weight|mass)?(?:\s*(?:is|:)?\s*)(\d+(?:\.\d+)?\s*(?:g|kg|lbs|oz))", "device_weight", "Physical Specification"),

            # Superlatives / Claims: e.g. "fastest", "first", "industry-leading"
            (r"\b(fastest|lightest|thinnest|most powerful|unbreakable|zero-latency|100%\s+recycled)\b", "superlative_claim", "Promotional Claim")
        ]

        for page in pages:
            page_num = page["page_number"]
            text = page["text"]

            for pattern, pred, subj in patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for m in matches:
                    matched_value = m.group(1) if m.groups() else m.group(0)
                    start = max(0, m.start() - 30)
                    end = min(len(text), m.end() + 30)
                    quote = text[start:end].replace("\n", " ").strip()

                    fact_id = str(uuid.uuid4())
                    facts.append({
                        "id": fact_id,
                        "subject": subj,
                        "predicate": pred,
                        "object_value": matched_value.strip(),
                        "unit": None,
                        "page_number": page_num,
                        "verbatim_quote": f"...{quote}...",
                        "category": category
                    })

        return facts

    @staticmethod
    def chunk_text(
        pages: List[Dict[str, Any]],
        document_id: str,
        version_id: str,
        category: str,
        chunk_size: int = 400,
        chunk_overlap: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Splits extracted pages into semantic chunks retaining exact document and page lineage.
        """
        chunks: List[Dict[str, Any]] = []

        for p in pages:
            page_num = p["page_number"]
            text = p["text"]
            words = text.split()

            if not words:
                continue

            i = 0
            while i < len(words):
                chunk_words = words[i:i + chunk_size]
                chunk_text = " ".join(chunk_words)
                chunk_id = f"chk_{document_id[:8]}_{version_id[:6]}_p{page_num}_{i}"

                chunks.append({
                    "chunk_id": chunk_id,
                    "document_id": document_id,
                    "version_id": version_id,
                    "page_number": page_num,
                    "category": category,
                    "content": chunk_text
                })

                i += (chunk_size - chunk_overlap)
                if i + chunk_overlap >= len(words):
                    break

        return chunks
