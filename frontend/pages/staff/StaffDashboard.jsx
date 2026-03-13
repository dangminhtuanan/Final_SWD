import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

const staffAPI = {
    getStats: async () => {
        const response = await axios.get('http://localhost:5001/api/staff/stats', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },
    getOrders: async (params) => {
        const response = await axios.get('http://localhost:5001/api/staff/orders', {
            params,
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    },
    updateOrderStatus: async (id, status) => {
        const response = await axios.put(
            `http://localhost:5001/api/staff/orders/${id}/status`,
            { status },
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        return response.data;
    },
    getLowStock: async () => {
        const response = await axios.get('http://localhost:5001/api/staff/products/low-stock', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return response.data;
    }
};

export default function StaffDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, ordersRes] = await Promise.all([
                staffAPI.getStats(),
                staffAPI.getOrders({ page: 1, limit: 10 }),
            ]);

            setStats(statsRes.data);
            setOrders(ordersRes.data.orders);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load dashboard data');
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

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-700',
            'processing': 'bg-blue-100 text-blue-700',
            'shipping': 'bg-purple-100 text-purple-700',
            'completed': 'bg-green-100 text-green-700',
            'cancelled': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <aside className={`w-64 bg-gradient-to-b from-teal-700 to-teal-900 text-white flex-shrink-0 flex-col ${isSidebarOpen ? 'flex' : 'hidden'} md:flex fixed md:relative h-full z-50`}>
                <div className="p-6 border-b border-teal-600 flex items-center justify-center">
                    <img
                        src="/picture/logo.png"
                        alt="Logo"
                        className="h-16 w-16 object-cover rounded-full"
                    />
                </div>
                <nav className="flex-1 mt-4">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center px-6 py-3 ${activeTab === 'overview' ? 'bg-teal-600 border-l-4 border-teal-400' : 'hover:bg-teal-700'} transition text-left`}
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
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">Staff Dashboard</h2>
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
                        <>
                            {activeTab === 'overview' && stats && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                        {/* Stats Cards */}
                                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
                                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</h3>
                                                </div>
                                                <div className="bg-yellow-100 p-4 rounded-full">
                                                    <i className="fas fa-clock text-yellow-600 text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Shipping Orders</p>
                                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.shippingOrders}</h3>
                                                </div>
                                                <div className="bg-purple-100 p-4 rounded-full">
                                                    <i className="fas fa-truck text-purple-600 text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Completed Today</p>
                                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.completedToday}</h3>
                                                </div>
                                                <div className="bg-green-100 p-4 rounded-full">
                                                    <i className="fas fa-check-circle text-green-600 text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Low Stock Items</p>
                                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.lowStockProducts}</h3>
                                                </div>
                                                <div className="bg-red-100 p-4 rounded-full">
                                                    <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</h3>
                                                </div>
                                                <div className="bg-blue-100 p-4 rounded-full">
                                                    <i className="fas fa-shopping-bag text-blue-600 text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-500">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">Cancelled Orders</p>
                                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.cancelledOrders}</h3>
                                                </div>
                                                <div className="bg-gray-100 p-4 rounded-full">
                                                    <i className="fas fa-times-circle text-gray-600 text-2xl"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Orders Table */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="font-bold text-gray-700">Recent Orders</h3>
                                            <button
                                                onClick={() => navigate('/staff/orders')}
                                                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                                            >
                                                View All
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {orders.slice(0, 5).map((order) => (
                                                        <tr key={order._id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 text-sm font-medium text-teal-600">
                                                                #{order._id.slice(-8).toUpperCase()}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm">{order.user?.username || 'N/A'}</td>
                                                            <td className="px-6 py-4 text-sm font-semibold">{formatPrice(order.totalAmount)}</td>
                                                            <td className="px-6 py-4 text-xs">
                                                                <span className={`${getStatusColor(order.status)} px-2 py-1 rounded-full`}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}

                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
