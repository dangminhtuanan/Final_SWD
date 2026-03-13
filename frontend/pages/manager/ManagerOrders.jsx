import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { managerAPI, orderAPI } from '../../src/services/api';
import { toast } from 'sonner';

export default function ManagerOrders() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [pagination.page, statusFilter, searchTerm]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = { page: pagination.page, limit: 10 };
            if (statusFilter) params.status = statusFilter;
            if (searchTerm.trim()) params.search = searchTerm.trim();

            const response = await managerAPI.getOrders(params);
            setOrders(response.data.orders);
            setPagination({
                page: response.data.page,
                pages: response.data.pages,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders list');
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
            'paid': 'bg-blue-100 text-blue-700',
            'shipping': 'bg-purple-100 text-purple-700',
            'delivered': 'bg-teal-100 text-teal-700',
            'completed': 'bg-green-100 text-green-700',
            'cancelled': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Pending',
            'paid': 'Paid',
            'shipping': 'Shipping',
            'delivered': 'Delivered',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    };

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
                    <img
                        src="/picture/logo.png"
                        alt="Logo"
                        className="h-16 w-16 object-cover rounded-full"
                    />
                </div>
                <nav className="flex-1 mt-4">
                    <button
                        onClick={() => navigate('/manager/dashboard')}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                    >
                        <i className="fas fa-chart-line mr-3"></i> Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/manager/orders')}
                        className="w-full flex items-center px-6 py-3 bg-teal-600 border-l-4 border-teal-400 text-left"
                    >
                        <i className="fas fa-shopping-cart mr-3"></i> Orders
                    </button>
                    <button
                        onClick={() => navigate('/manager/products')}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                    >
                        <i className="fas fa-box mr-3"></i> Products
                    </button>
                    <button
                        onClick={() => navigate('/manager/categories')}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                    >
                        <i className="fas fa-tags mr-3"></i> Categories
                    </button>
                    <button
                        onClick={() => navigate('/manager/reports')}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                    >
                        <i className="fas fa-chart-bar mr-3"></i> Reports
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left"
                    >
                        <i className="fas fa-home mr-3"></i> Home
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-6 py-3 hover:bg-teal-700 transition text-left mt-4 border-t border-teal-600"
                    >
                        <i className="fas fa-sign-out-alt mr-3"></i> Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white shadow-sm px-4 md:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button
                            className="md:hidden text-gray-500"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <i className="fas fa-bars text-xl"></i>
                        </button>
                        <h2 className="text-lg md:text-xl font-semibold text-gray-800">Order Manager</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-500 hover:text-teal-600">
                            <i className="fas fa-bell"></i>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
                            {user?.username?.charAt(0).toUpperCase() || 'M'}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="relative flex-1 min-w-[220px]">
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                                <input
                                    type="text"
                                    placeholder="Search by order ID or customer..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                    }}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                                />
                            </div>
                            <label className="text-gray-700 font-medium">Status:</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            >
                                <option value="">All</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="shipping">Shipping</option>
                                <option value="delivered">Delivered</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <div className="ml-auto text-gray-600">
                                Total: <span className="font-semibold text-teal-600">{pagination.total}</span> orders
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600"></div>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gradient-to-r from-teal-50 to-teal-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Order ID
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Customer
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Total Amount
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Order Date
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {orders.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                        No orders found
                                                    </td>
                                                </tr>
                                            ) : (
                                                orders.map((order) => (
                                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-medium text-gray-900">
                                                                #{order._id.slice(-8).toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{order.user?.username || 'N/A'}</div>
                                                            <div className="text-sm text-gray-500">{order.user?.email || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="text-sm font-bold text-teal-600">
                                                                {formatPrice(order.totalAmount)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                                {getStatusText(order.status)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                onClick={() => openDetailModal(order)}
                                                                className="px-3 py-1 bg-teal-600 text-white text-xs rounded-lg hover:bg-teal-700 transition"
                                                            >
                                                                <i className="fas fa-eye mr-1"></i> View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                        <div className="text-sm text-gray-600">
                                            Page {pagination.page} / {pagination.pages} &nbsp;·&nbsp; Total <span className="font-semibold text-teal-600">{pagination.total}</span> orders
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                                                disabled={pagination.page === 1}
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <i className="fas fa-chevron-left text-xs"></i>
                                            </button>
                                            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                                                .filter(p => p === 1 || p === pagination.pages || Math.abs(p - pagination.page) <= 1)
                                                .reduce((acc, p, idx, arr) => { if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...'); acc.push(p); return acc; }, [])
                                                .map((p, idx) => p === '...' ? (
                                                    <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">...</span>
                                                ) : (
                                                    <button
                                                        key={p}
                                                        onClick={() => setPagination({ ...pagination, page: p })}
                                                        className={`w-8 h-8 flex items-center justify-center border rounded-lg text-sm font-medium transition ${pagination.page === p ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-300 hover:bg-gray-100'}`}
                                                    >{p}</button>
                                                ))}
                                            <button
                                                onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                                                disabled={pagination.page === pagination.pages}
                                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <i className="fas fa-chevron-right text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
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
                            {/* Order Info */}
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
                                            {getStatusText(selectedOrder.order?.status)}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Order Items */}
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

                            {/* Total */}
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
