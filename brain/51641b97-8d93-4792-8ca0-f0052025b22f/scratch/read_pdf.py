import pypdf

reader = pypdf.PdfReader("docs/rekap_rekam_medis_2026-06-03 (1).pdf")
print("Total pages:", len(reader.pages))

for idx, page in enumerate(reader.pages):
    print(f"--- PAGE {idx+1} ---")
    print(page.extract_text()[:2000]) # Print first 2000 chars of each page
