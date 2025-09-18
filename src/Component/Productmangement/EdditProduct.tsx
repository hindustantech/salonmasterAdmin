import React from "react";
import { X } from "lucide-react";
// Define types for product and related data
export interface Category {
  _id?: string;
  name: string;
}


export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  originalPrice: number;
  discountPercent: number;
  price: number;
  category?: Category;
  tags: string[];
  trackQuantity: boolean;
  quantity: number;
  status: 'draft' | 'active' | 'archived' | 'out_of_stock';
  images: string[];
  createdAt: string;
}

interface EditProductModalProps {
  selectedProduct: Product | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  setShowEditModal: (val: boolean) => void;
  updateProduct: () => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  selectedProduct,
  setSelectedProduct,
  setShowEditModal,
  updateProduct,
}) => {
  if (!selectedProduct) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Product</h2>
          <button onClick={() => setShowEditModal(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={selectedProduct.name}
              onChange={(e) =>
                setSelectedProduct((prev) =>
                  prev ? { ...prev, name: e.target.value } : prev
                )
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={selectedProduct.description}
              onChange={(e) =>
                setSelectedProduct((prev) =>
                  prev ? { ...prev, description: e.target.value } : prev
                )
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price
              </label>
              <input
                type="number"
                value={selectedProduct.originalPrice || ""}
                onChange={(e) =>
                  setSelectedProduct((prev) =>
                    prev ? { ...prev, originalPrice: Number(e.target.value) } : prev
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount %
              </label>
              <input
                type="number"
                value={selectedProduct.discountPercent || ""}
                onChange={(e) =>
                  setSelectedProduct((prev) =>
                    prev
                      ? { ...prev, discountPercent: Number(e.target.value) }
                      : prev
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Quantity + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>      
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={selectedProduct.quantity || ""}
                onChange={(e) =>
                  setSelectedProduct((prev) =>
                    prev ? { ...prev, quantity: Number(e.target.value) } : prev
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedProduct.status}
                onChange={(e) =>
                  setSelectedProduct((prev) =>
                    prev
                      ? { ...prev, status: e.target.value as Product["status"] }
                      : prev
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={updateProduct}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors"
          >
            Update Product
          </button>
          <button
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
