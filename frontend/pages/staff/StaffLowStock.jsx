import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

const staffAPI = {
    getLowStock: async () => {
        const response = await axios.get('http://localhost:5001/api/staff/products/low-stock', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    }
};

export default function StaffLowStock() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLowStock();
    }, []);

    const fetchLowStock = async () => {
        try {
            setLoading(true);
            const res = await staffAPI.getLowStock();
            setLowStockProducts(res.data || []);
        } catch (error) {
            console.error('Error fetching low stock:', error);
            toast.error('Failed to load low stock products');
        } finally {
            setLoading(false);
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

    const filtered = lowStockProducts.filter(p =>
        !searchTerm ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStockColor = (stock) => {
        if (stock === 0) return 'text-red-700 bg-red-100';
        if (stock <= 5) return 'text-red-600 bg-red-50';
        return 'text-orange-600 bg-orange-50';
    };

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
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                    >
                        <i className="fas fa-tag mr-3"></i> Products
                    </button>
                    <button
                        onClick={() => navigate('/staff/low-stock')}
                        className="w-full flex items-center px-6 py-3 bg-teal-600 border-l-4 border-teal-400 transition text-left"
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
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">Low Stock Products</h2>
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
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Low Stock Alert</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{filtered.length} product{filtered.length !== 1 ? 's' : ''} need attention</p>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search product / category..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 w-64"
                                />
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
                                        {filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">
                                                    No low stock products found.
                                                </td>
                                            </tr>
                                        ) : filtered.map((product) => (
                                            <tr key={product._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {product.images?.[0] ? (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                <i className="fas fa-box text-gray-400 text-xs"></i>
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {product.category?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                                                    {formatPrice(product.price)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${getStockColor(product.stock)}`}>
                                                        {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
