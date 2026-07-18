import sqlite3

conn = sqlite3.connect("products.db")
cur = conn.cursor()

# Utwórz tabelę, jeśli nie istnieje
cur.execute("""
CREATE TABLE IF NOT EXISTS products (
    barcode TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL
)
""")

# Dodaj przykładowe produkty
products = [
    ("5901234123457", "Coca Cola 500ml", 7.99),
    ("5901111111111", "Chleb", 4.49),
]

cur.executemany(
    "INSERT OR REPLACE INTO products (barcode, name, price) VALUES (?, ?, ?)",
    products
)

conn.commit()
conn.close()

print("✅ Baza danych utworzona, tabela istnieje i produkty zostały dodane.")