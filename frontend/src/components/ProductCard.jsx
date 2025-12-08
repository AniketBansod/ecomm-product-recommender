import { Link } from "react-router-dom";

<Link to={`/product/${product._id}`}>
  <div className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer">
    <img src={product.image_url} className="h-40 w-full object-cover rounded" />
    <h3 className="mt-2 font-semibold">{product.title}</h3>
    <p className="text-indigo-600 font-bold">₹ {product.price}</p>
  </div>
</Link>
