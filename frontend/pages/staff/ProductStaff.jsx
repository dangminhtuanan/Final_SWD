import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/axios';
import { toast } from 'sonner';

const staffAPI = {
    getProducts: async (params) => {
        const response = await api.get('/products', { params });
        return response.data;
    },
    getCategories: async () => {
        const response = await api.get('/categories');
        return response.data;
    },
};

export default function ProductStaff() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await staffAPI.getProducts({ limit: 500 });
            setProducts(res.data || res || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await staffAPI.getCategories();
            setCategories(res.data || res || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getStockColor = (stock) => {
        if (stock === 0) return 'bg-red-100 text-red-700';
        if (stock <= 10) return 'bg-orange-100 text-orange-700';
        return 'bg-green-100 text-green-700';
    };

    const filteredProducts = products.filter(p => {
        const matchSearch = !searchTerm ||
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = categoryFilter === 'all' || p.category?._id === categoryFilter || p.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <aside className={`w-64 bg-gradient-to-b from-teal-700 to-teal-900 text-white flex-shrink-0 flex-col ${isSidebarOpen ? 'flex' : 'hidden'} md:flex fixed md:relative h-full z-50`}>
                <div className="p-6 border-b border-teal-600 flex items-center justify-center">
                    <img src="/picture/logo.png" alt="Logo" className="h-16 w-16 object-cover rounded-full" />
                </div>
                <nav className="flex-1 mt-4">
                    <button
                        onClick={() => navigate('/staff/dashboard')}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                    >
                        <i className="fas fa-chart-line mr-3"></i> Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/staff/orders')}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                    >
                        <i className="fas fa-shopping-cart mr-3"></i> Orders
                    </button>
                    <button
                        onClick={() => navigate('/staff/products')}
                        className="w-full flex items-center px-6 py-3 bg-teal-600 border-l-4 border-teal-400 transition text-left"
                    >
                        <i className="fas fa-tag mr-3"></i> Products
                    </button>
                    <button
                        onClick={() => navigate('/staff/low-stock')}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                    >
                        <i className="fas fa-box mr-3"></i> Low Stock
                    </button>
                </nav>
                <div className="p-4 border-t border-teal-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 rounded transition text-left"
                    >
                        <i className="fas fa-sign-out-alt mr-3"></i> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="md:hidden text-gray-600 hover:text-gray-900"
                    >
                        <i className="fas fa-bars text-2xl"></i>
                    </button>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">Product List</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700 font-medium">{user?.username || 'Staff'}</span>
                        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                            {user?.username?.charAt(0).toUpperCase() || 'S'}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600"></div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            {/* Toolbar */}
                            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800">
                                    Products
                                    <span className="ml-2 text-sm font-normal text-gray-400">({filteredProducts.length})</span>
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    <input
                                        type="text"
                                        placeholder="Search by name / category..."
                                        value={searchTerm}
                                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 w-56"
                                    />
                                    <select
                                        value={categoryFilter}
                                        onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">
                                                    No products found.
                                                </td>
                                            </tr>
                                        ) : paginatedProducts.map((product) => {
                                            const image = product.images?.[0] || product.image;
                                            return (
                                                <tr key={product._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                                {image ? (
                                                                    <img src={image} alt={product.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                                        <i className="fas fa-image text-gray-400 text-xs"></i>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</div>
                                                                <div className="text-xs text-gray-400">#{product._id?.slice(-6).toUpperCase()}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {product.category?.name || '—'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-teal-600">
                                                        {formatPrice(product.price)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStockColor(product.stock)}`}>
                                                            {product.stock ?? 0}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                                    <div className="text-sm text-gray-500">
                                        Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <i className="fas fa-chevron-left text-xs"></i>
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                            .reduce((acc, p, idx, arr) => {
                                                if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...');
                                                acc.push(p);
                                                return acc;
                                            }, [])
                                            .map((p, idx) => p === '...' ? (
                                                <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">...</span>
                                            ) : (
                                                <button
                                                    key={p}
                                                    onClick={() => setCurrentPage(p)}
                                                    className={`w-8 h-8 flex items-center justify-center border rounded-lg text-sm font-medium transition ${currentPage === p ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-300 hover:bg-gray-100'}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <i className="fas fa-chevron-right text-xs"></i>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
