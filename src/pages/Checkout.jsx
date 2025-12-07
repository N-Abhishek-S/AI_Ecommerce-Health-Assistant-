import { useCart } from "../context/CartContext.jsx";

export default function Checkout() {
  const { items, total, clear } = useCart();
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold">Checkout</h1>
      <p className="opacity-70">
        Mock payment integration. This is a placeholder page.
      </p>
      <div className="mt-6 rounded-3xl border p-6 space-y-4">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between">
            <span className="font-semibold">
              {it.name} × {it.qty}
            </span>
            <span>${(it.price * it.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t pt-4">
          <span className="font-bold">Total</span>
          <span className="font-extrabold text-xl">${total.toFixed(2)}</span>
        </div>
        <button
          onClick={() => {
            alert("Payment successful (mock)");
            clear();
          }}
          className="w-full px-5 py-3 rounded-2xl font-extrabold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
        >
          Pay now
        </button>
      </div>
    </div>
  );
}
