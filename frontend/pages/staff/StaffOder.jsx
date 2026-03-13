import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { orderAPI } from '../../src/services/api';
import api from '../../src/services/axios';
import { toast } from 'sonner';

const staffAPI = {
    getOrders: async (params) => {
        const response = await api.get('/staff/orders', { params });
        return response.data;
    },
    updateOrderStatus: async (id, status) => {
        const response = await api.put(`/staff/orders/${id}/status`, { status });
        return response.data;
    },
};

export default function StaffOrder() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await staffAPI.getOrders({ page: 1, limit: 200 });
            setOrders(res.data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await staffAPI.updateOrderStatus(orderId, newStatus);
            toast.success('Order status updated successfully');
            fetchOrders();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Failed to update order status');
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
            'paid': 'bg-blue-100 text-blue-700',
            'shipping': 'bg-purple-100 text-purple-700',
            'delivered': 'bg-indigo-100 text-indigo-700',
            'completed': 'bg-green-100 text-green-700',
            'cancelled': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const filteredOrders = orders.filter(order => {
        const matchSearch = !searchTerm ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const openDetailModal = async (order) => {
        try {
            const response = await orderAPI.getById(order._id);
            setSelectedOrder(response);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Failed to load order details');
        }
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
                        className="w-full flex items-center px-6 py-3 bg-teal-600 border-l-4 border-teal-400 transition text-left"
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
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">Manage Orders</h2>
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
                                <h3 className="text-lg font-bold text-gray-800">Orders</h3>
                                <div className="flex flex-wrap gap-3">
                                    <input
                                        type="text"
                                        placeholder="Search by ID / customer..."
                                        value={searchTerm}
                                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 w-56"
                                    />
                                    <select
                                        value={statusFilter}
                                        onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="shipping">Shipping</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                                                    No orders found.
                                                </td>
                                            </tr>
                                        ) : paginatedOrders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm font-medium text-teal-600">
                                                    #{order._id.slice(-8).toUpperCase()}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div>{order.user?.username || 'N/A'}</div>
                                                    <div className="text-xs text-gray-400">{order.user?.email || ''}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold text-teal-600">
                                                    {formatPrice(order.totalAmount)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => openDetailModal(order)}
                                                        className="px-3 py-1 bg-teal-600 text-white text-xs rounded-lg hover:bg-teal-700 transition"
                                                    >
                                                        <i className="fas fa-eye mr-1"></i> View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                                    <div className="text-sm text-gray-500">
                                        Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredOrders.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
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

            {/* Order Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-bold text-gray-900">
                                Order Details - #{selectedOrder.order?._id.slice(-8).toUpperCase()}
                            </h3>
                            <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Customer Email</label>
                                    <p className="text-gray-900 mt-1">{selectedOrder.order?.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Order Date</label>
                                    <p className="text-gray-900 mt-1">{new Date(selectedOrder.order?.createdAt).toLocaleString('vi-VN')}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-500">Shipping Address</label>
                                    <p className="text-gray-900 mt-1">
                                        {selectedOrder.order?.shippingAddress
                                            ? typeof selectedOrder.order.shippingAddress === 'string'
                                                ? selectedOrder.order.shippingAddress
                                                : `${selectedOrder.order.shippingAddress.firstName || ''} ${selectedOrder.order.shippingAddress.lastName || ''}, ${selectedOrder.order.shippingAddress.phone || ''}, ${selectedOrder.order.shippingAddress.address || ''}, ${selectedOrder.order.shippingAddress.district || ''}, ${selectedOrder.order.shippingAddress.city || ''}`
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Payment Method</label>
                                    <p className="text-gray-900 mt-1">
                                        {selectedOrder.order?.paymentMethod === 'vnpay' ? 'VNPay' :
                                            selectedOrder.order?.paymentMethod === 'cod' ? 'COD (Cash on Delivery)' : 'Not Specified'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <p className="mt-1">
                                        <span className={`${getStatusColor(selectedOrder.order?.status)} px-2 py-1 rounded-full text-xs font-semibold`}>
                                            {selectedOrder.order?.status}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Product</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Price</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Qty</th>
                                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedOrder.items?.map((item, index) => {
                                                const image = item.product?.images?.[0] || item.product?.image;
                                                return (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                                    {image ? (
                                                                        <img src={image} alt={item.product?.name} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                            <i className="fas fa-image text-lg"></i>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">{item.product?.name || 'N/A'}</p>
                                                                    {item.size && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">{formatPrice(item.price)}</td>
                                                        <td className="px-4 py-3 text-sm">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-sm font-semibold">{formatPrice(item.price * item.quantity)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="border-t pt-4 flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                                <span className="text-2xl font-bold text-teal-600">{formatPrice(selectedOrder.order?.totalAmount)}</span>
                            </div>
                        </div>
                        <div className="flex justify-end p-6 border-t">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
