// TestProducts.jsx
import React from 'react';
import { getProductsByGender } from '../data/products';

const TestProducts = () => {
  const [maleProducts, setMaleProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const products = getProductsByGender('male', 'clothing', 6);
    setMaleProducts(products);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Test Products (Male)</h2>
      <p>Found {maleProducts.length} products</p>
      <ul>
        {maleProducts.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default TestProducts;