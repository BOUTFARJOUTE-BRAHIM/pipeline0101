import { useState } from "react";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import "./App.css";

function App() {
  const [page, setPage] = useState("products");
  const [cartVersion, setCartVersion] = useState(0);

  const refreshCart = () => {
    setCartVersion((v) => v + 1);
  };

  return (
    <div className="App">
      <header
        style={{
          padding: "20px",
          background: "#1976d2",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>🛒 E-Commerce Microservices</h1>

        <nav>
          <button
            onClick={() => setPage("products")}
            style={{ marginRight: "10px" }}
          >
            Produits
          </button>

          <button onClick={() => setPage("cart")}>
            Panier
          </button>
        </nav>
      </header>

      <main style={{ padding: "20px" }}>
        {page === "products" && (
          <ProductList onCartUpdate={refreshCart} />
        )}

        {page === "cart" && (
          <Cart
            key={cartVersion}
            onCartUpdate={refreshCart}
            onNavigate={setPage}
          />
        )}
      </main>
    </div>
  );
}

export default App;
