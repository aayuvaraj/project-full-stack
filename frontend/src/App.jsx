import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
    supplier: ""
  });

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ADD PRODUCT
  const addProduct = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...form,
            quantity: Number(form.quantity),
            price: Number(form.price)
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      setForm({
        name: "",
        category: "",
        quantity: "",
        price: "",
        supplier: ""
      });

      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  // SELECT PRODUCT FOR EDITING
  const editProduct = (product) => {
    setEditingId(product._id);

    setForm({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      price: product.price,
      supplier: product.supplier
    });
  };

  // UPDATE PRODUCT
  const updateProduct = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...form,
            quantity: Number(form.quantity),
            price: Number(form.price)
          })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      setEditingId(null);

      setForm({
        name: "",
        category: "",
        quantity: "",
        price: "",
        supplier: ""
      });

      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  // DASHBOARD
  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const totalValue = products.reduce(
    (total, product) => total + product.quantity * product.price,
    0
  );

  const lowStock = products.filter(
    (product) => product.quantity < 5
  ).length;
  const exportCSV = () => {
  const headers = [
    "Name",
    "Category",
    "Quantity",
    "Price",
    "Supplier"
  ];

  const rows = products.map((product) => [
    product.name,
    product.category,
    product.quantity,
    product.price,
    product.supplier
  ]);

  const csvContent = [
    headers,
    ...rows
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv"
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "inventory.csv";

  link.click();

  window.URL.revokeObjectURL(url);
};

  return (
    <div className="app">

      <h1>Inventory Management System</h1>
      <div className="export-section">
  <button onClick={exportCSV}>
    Export Inventory CSV
  </button>
</div>

      {/* DASHBOARD */}
      <div className="dashboard">

        <div className="stat-card">
          <h3>Total Products</h3>
          <p>{totalProducts}</p>
        </div>

        <div className="stat-card">
          <h3>Total Stock</h3>
          <p>{totalStock}</p>
        </div>

        <div className="stat-card">
          <h3>Inventory Value</h3>
          <p>₹{totalValue.toLocaleString()}</p>
        </div>

        <div className="stat-card">
          <h3>Low Stock</h3>
          <p>{lowStock}</p>
        </div>

      </div>

      <div className="container">

        {/* ADD / EDIT FORM */}
        <div className="card">

          <h2>
            {editingId ? "Edit Product" : "Add Product"}
          </h2>

          <form
            onSubmit={editingId ? updateProduct : addProduct}
          >

            <input
              name="name"
              placeholder="Product Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
              required
            />

            <input
              name="quantity"
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              required
            />

            <input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              required
            />

            <input
              name="supplier"
              placeholder="Supplier"
              value={form.supplier}
              onChange={handleChange}
            />

            <button type="submit">
              {editingId ? "Update Product" : "Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);

                  setForm({
                    name: "",
                    category: "",
                    quantity: "",
                    price: "",
                    supplier: ""
                  });
                }}
              >
                Cancel
              </button>
            )}

          </form>

        </div>

        {/* PRODUCTS */}
        <div className="card">

          <h2>Products</h2>

          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {products.length === 0 ? (
            <p>No products available.</p>
          ) : (

            <table>

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Supplier</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {products
                  .filter(
                    (product) =>
                      product.name
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      product.category
                        .toLowerCase()
                        .includes(search.toLowerCase())
                  )
                  .map((product) => (

                    <tr key={product._id}>

                      <td>{product.name}</td>

                      <td>{product.category}</td>

                      <td>
  {product.quantity}
  {product.quantity < 5 && (
    <span className="low-stock"> Low Stock</span>
  )}
</td>

                      <td>₹{product.price}</td>

                      <td>{product.supplier}</td>

                      <td>

                        <button
                          onClick={() => editProduct(product)}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteProduct(product._id)
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>
  );
}

export default App;