import React from "react";
import { X } from "lucide-react";

interface NewProduct {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  originalPrice: number;
  discountPercent: number;
  category: string;
  tags: string[];
  trackQuantity: boolean;
  quantity: number;
  status: 'draft' | 'active' | 'archived';
  images: File[];
}

interface CreateProductModalProps {
  newProduct: NewProduct;
  setNewProduct: React.Dispatch<React.SetStateAction<NewProduct>>;
  setShowCreateModal: (val: boolean) => void;
  createProduct: () => void;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  newProduct,
  setNewProduct,
  setShowCreateModal,
  createProduct,
}) => {
  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Product</h2>
          <button onClick={() => setShowCreateModal(false)}>
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
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <input
              type="text"
              value={newProduct.slug}
              onChange={(e) =>
                setNewProduct((prev) => ({ ...prev, slug: e.target.value }))
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
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
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
                value={newProduct.originalPrice || ""}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    originalPrice: Number(e.target.value),
                  }))
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
                value={newProduct.discountPercent || ""}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    discountPercent: Number(e.target.value),
                  }))
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
                value={newProduct.quantity || ""}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={newProduct.status}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    status: e.target.value as NewProduct["status"],
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setNewProduct((prev) => ({
                  ...prev,
                  images: e.target.files ? Array.from(e.target.files) : [],
                }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={createProduct}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors"
          >
            Create Product
          </button>
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProductModal;
