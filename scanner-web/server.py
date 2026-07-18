from flask import Flask, request, jsonify, render_template
import sqlite3
from flask_cors import CORS

app = Flask(__name__)

DB = "products.db"

@app.route("/")
def index():
    return render_template("index.html")


def init_db():
    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS products(
        barcode TEXT PRIMARY KEY,
        name TEXT,
        price REAL
    )
    """)

    conn.commit()
    conn.close()


@app.route("/ping")
def ping():
    return jsonify({"status": "ok"})


@app.route("/scan", methods=["POST"])
def scan():
    
    data = request.json
    print("Odebrane dane:", data)   # <-- dodaj tę linię
    barcode = data.get("barcode")
    print("Kod:", barcode)

    conn = sqlite3.connect(DB)
    cur = conn.cursor()

    cur.execute(
        "SELECT name, price FROM products WHERE barcode=?",
        (barcode,)
    )

    row = cur.fetchone()
    conn.close()

    if row:
        return jsonify({
            "success": True,
            "barcode": barcode,
            "name": row[0],
            "price": row[1]
        })

    return jsonify({
        "success": False,
        "message": "Produkt nie istnieje"
    })


import os

init_db()

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
    )
