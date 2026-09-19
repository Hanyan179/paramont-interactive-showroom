"""Aggregate country coverage without exporting customer/supplier identities.

Uses worksheet XML rows, not the optional (and sometimes incorrect) dimension.
Run: python3 scripts/import-business-footprint.py CUSTOMERS.xlsx SUPPLIERS.xlsx
"""
import argparse
from collections import Counter
from datetime import date
import hashlib
import json
from pathlib import Path
import posixpath
import xml.etree.ElementTree as ET
from zipfile import ZipFile

NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
BASE = Path(__file__).resolve().parent.parent


def worksheet_rows(path, name):
    with ZipFile(path) as archive:
        shared = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared = ["".join(node.itertext()) for node in ET.fromstring(archive.read("xl/sharedStrings.xml"))]
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        sheets = workbook.findall("s:sheets/s:sheet", NS)
        sheet = next(sheet for sheet in sheets if sheet.get("name") == name)
        relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        target = next(rel.get("Target") for rel in relationships if rel.get("Id") == sheet.get(f"{{{REL}}}id"))
        target = target.lstrip("/") if target.startswith("/") else posixpath.normpath("xl/" + target)
        for row in ET.fromstring(archive.read(target)).findall("s:sheetData/s:row", NS):
            values = {}
            for cell in row.findall("s:c", NS):
                column = "".join(char for char in cell.get("r") if char.isalpha())
                value = cell.findtext("s:v", default="", namespaces=NS)
                if cell.get("t") == "s":
                    value = shared[int(value)]
                elif cell.get("t") == "inlineStr":
                    value = "".join(node.text or "" for node in cell.findall("s:is//s:t", NS))
                values[column] = value.strip()
            yield int(row.get("r")), values


def aggregate(path, sheet, expected_headers, mapping):
    rows = list(worksheet_rows(path, sheet))
    assert [rows[0][1].get(column) for column in "ABC"] == expected_headers, "Unexpected worksheet columns"
    records = [(number, row) for number, row in rows[1:] if any(row.values())]
    ids = [row.get("A", "") for _, row in records]
    assert all(ids) and len(ids) == len(set(ids)), "Missing or duplicate master record IDs"
    raw = Counter(row.get("C", "").upper() for _, row in records)
    counts = Counter()
    for code, count in raw.items():
        if not code:
            continue
        canonical = mapping["aliases"].get(code, code)
        assert canonical in mapping["countries"], f"Unmapped country code: {code}"
        counts[canonical] += count
    return counts, {
        "file": path.name, "sheet": sheet, "recordRange": f"A{records[0][0]}:E{records[-1][0]}",
        "countryColumn": "C", "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "totalRecords": len(records), "locatedRecords": sum(counts.values()),
        "missingCountryRecords": raw.get("", 0), "countryCount": len(counts),
        "rawCountryCodes": dict(sorted((code or "(blank)", count) for code, count in raw.items())),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("customers", type=Path)
    parser.add_argument("suppliers", type=Path)
    args = parser.parse_args()
    mapping = json.loads((BASE / "scripts/business-country-codes.json").read_text())
    customers, customer_source = aggregate(args.customers, "Customer Master List", ["No.", "Customer Name", "Country"], mapping)
    suppliers, supplier_source = aggregate(args.suppliers, "导出结果", ["MD_CODE", "NAME", "COUNTRY_REGION_CODE"], mapping)
    result = {
        "schemaVersion": 1, "importedOn": date.today().isoformat(), "reportingPeriod": None,
        "unit": "master records", "countryField": "Explicit country column; never inferred from entity name",
        "notes": ["Master archive coverage, not active customers, active suppliers, owned factories, sales or transaction routes.",
                  "Blank countries count toward totals but are not located on the map.",
                  "UK and GB are combined as GB. PA is retained as Panama despite missing source name cells."],
        "geographySources": mapping["sources"], "aliases": mapping["aliases"],
        "sources": {"customers": customer_source, "suppliers": supplier_source},
        "countries": [{"code": code, **mapping["countries"][code], "customers": customers[code], "suppliers": suppliers[code]}
                      for code in sorted(customers.keys() | suppliers.keys())],
    }
    output = BASE / "public/data/business-footprint.json"
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({key: {field: value for field, value in source.items() if field in ["totalRecords", "locatedRecords", "missingCountryRecords", "countryCount"]} for key, source in result["sources"].items()}, ensure_ascii=False))
    print(f"Wrote {len(result['countries'])} country/area aggregates to {output.name}")


if __name__ == "__main__":
    main()
