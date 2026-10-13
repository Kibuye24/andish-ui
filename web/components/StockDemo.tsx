"use client";

import { useState } from "react";

const PRICE = 2500;
const FULL = 12;

const kes = (n: number) => n.toLocaleString("en-KE");

export default function StockDemo() {
  const [sold, setSold] = useState(0);
  const stock = FULL - sold;

  let status = "Example data for a bakery.";
  if (stock === 0) status = "Sold out. The store page now shows this cake as unavailable.";
  else if (stock <= 3) status = "Running low. Time to bake more.";
  else if (sold > 0) status = "Sale posted. Stock and takings moved together.";

  const sales = Array.from({ length: sold }, (_, i) => i + 1)
    .reverse()
    .slice(0, 5);

  return (
    <div className="till">
      <div className="till-shelf">
        <p className="eyebrow">Black forest cake, 1 kg</p>
        <p className="till-count">
          {stock}
          <small>on the shelf</small>
        </p>
        <div className="till-acts">
          <button className="pill" type="button" disabled={stock === 0} onClick={() => setSold((n) => n + 1)}>
            Sell one cake
          </button>
          <button className="text-link" type="button" onClick={() => setSold(0)}>
            Restock to {FULL}
          </button>
        </div>
        <p className="till-status" aria-live="polite">
          {status}
        </p>
      </div>
      <div className="till-books">
        <p className="eyebrow">Sales today</p>
        <div className="scroll-x">
          <table>
            <thead>
              <tr>
                <th>Sale</th>
                <th>Paid by</th>
                <th>Stock after</th>
                <th>KES</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr className="is-empty">
                  <td colSpan={4}>No sales yet. Sell a cake to post one.</td>
                </tr>
              ) : (
                sales.map((n) => (
                  <tr key={n}>
                    <td>SAL-{String(n).padStart(4, "0")}</td>
                    <td>M-Pesa</td>
                    <td>{FULL - n}</td>
                    <td>{kes(PRICE)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="till-total">
          <span>Received by M-Pesa</span>
          <span>KES {kes(sold * PRICE)}</span>
        </p>
      </div>
    </div>
  );
}
