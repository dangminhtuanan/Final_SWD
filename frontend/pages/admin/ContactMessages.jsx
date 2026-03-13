import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { contactAPI } from '../../src/services/api';
import { toast } from 'sonner';

export default function ContactMessages() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('all'); // all | unread | read
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replying, setReplying] = useState(false);

    const fetchMessages = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (filter === 'unread') params.isRead = false;
            if (filter === 'read') params.isRead = true;
            const res = await contactAPI.getAll(params);
            setMessages(res.data || []);
            setPagination(res.pagination || { total: 0, page: 1, pages: 1 });
        } catch (err) {
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMessages(1); }, [filter]);

    const handleOpen = async (msg) => {
        setSelected(msg);
        setReplyText('');
        if (!msg.isRead) {
            try {
                await contactAPI.markAsRead(msg._id);
                setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
                setSelected(prev => prev ? { ...prev, isRead: true } : prev);
            } catch { /* ignore */ }
        }
    };

    const handleDelete = async (id) => {
        try {
            await contactAPI.delete(id);
            toast.success('Message deleted');
            setMessages(prev => prev.filter(m => m._id !== id));
            if (selected?._id === id) setSelected(null);
            setDeleteConfirm(null);
        } catch {
            toast.error('Failed to delete message');
        }
    };

    const filtered = messages.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase())
    );

    const unreadCount = messages.filter(m => !m.isRead).length;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleReply = async () => {
        if (!replyText.trim() || !selected) return;
        setReplying(true);
        try {
            await contactAPI.reply(selected._id, replyText);
            toast.success(`Reply sent to ${selected.email}`);
            setReplyText('');
            setMessages(prev => prev.map(m => m._id === selected._id ? { ...m, isRead: true } : m));
            setSelected(prev => prev ? { ...prev, isRead: true } : prev);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send reply');
        } finally {
            setReplying(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <aside className={`w-64 bg-indigo-900 text-white flex-shrink-0 flex-col ${isSidebarOpen ? 'flex' : 'hidden'} md:flex fixed md:relative h-full z-50`}>
                <div className="p-6 border-b border-indigo-800 flex items-center justify-center">
                    <img
                        src="/picture/logo.png"
                        alt="Logo"
                        className="h-16 w-16 object-cover rounded-full"
                    />
                </div>
                <nav className="flex-1 mt-4">
                    <button onClick={() => navigate('/admin/dashboard')} className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left">
                        <i className="fas fa-chart-line mr-3"></i> Dashboard
                    </button>
                    <button onClick={() => navigate('/admin/users')} className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left">
                        <i className="fas fa-users mr-3"></i> Users
                    </button>
                    <button onClick={() => navigate('/admin/products')} className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left">
                        <i className="fas fa-box mr-3"></i> Products
                    </button>
                    <button onClick={() => navigate('/admin/categories')} className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left">
                        <i className="fas fa-tags mr-3"></i> Categories
                    </button>
                    <button onClick={() => navigate('/admin/orders')} className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left">
                        <i className="fas fa-shopping-cart mr-3"></i> Orders
                    </button>
                    <button onClick={() => navigate('/admin/reports')} className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left">
                        <i className="fas fa-file-alt mr-3"></i> Reports
                    </button>
                    <button onClick={() => navigate('/admin/ai-behavior-logs')} className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left">
                        <i className="fas fa-robot mr-3"></i> AI Behavior Logs
                    </button>
                    <button onClick={() => navigate('/admin/contacts')} className="w-full flex items-center px-6 py-3 bg-indigo-800 border-l-4 border-blue-400 text-left">
                        <i className="fas fa-envelope mr-3"></i> Contact Messages
                        {unreadCount > 0 && (
                            <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                        )}
                    </button>
                    <button onClick={() => navigate('/')} className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left">
                        <i className="fas fa-home mr-3"></i> Home
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center px-6 py-3 hover:bg-indigo-800 transition text-left mt-4 border-t border-indigo-800">
                        <i className="fas fa-sign-out-alt mr-3"></i> Logout
                    </button>
                </nav>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm px-4 md:px-8 py-4 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <button className="md:hidden text-gray-500" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <i className="fas fa-bars text-xl"></i>
                        </button>
                        <div>
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800">Contact Messages</h2>
                            <p className="text-sm text-gray-400">{pagination.total} total · {unreadCount} unread</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-500 hover:text-indigo-600">
                            <i className="fas fa-bell"></i>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                            {user?.username?.charAt(0).toUpperCase() || 'A'}
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 md:p-8 flex gap-6 overflow-hidden">
                    {/* Message List */}
                    <div className={`flex flex-col ${selected ? 'w-80 flex-shrink-0 hidden md:flex' : 'flex-1'}`}>
                        {/* Filters + Search */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 space-y-3">
                            <div className="relative">
                                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by name, email, subject..."
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-2">
                                {[['all', 'All'], ['unread', 'Unread'], ['read', 'Read']].map(([val, label]) => (
                                    <button
                                        key={val}
                                        onClick={() => setFilter(val)}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === val ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                                    <i className="fas fa-inbox text-3xl"></i>
                                    <p className="text-sm">No messages found</p>
                                </div>
                            ) : (
                                filtered.map(msg => (
                                    <div
                                        key={msg._id}
                                        onClick={() => handleOpen(msg)}
                                        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${selected?._id === msg._id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''} ${!msg.isRead ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                {!msg.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>}
                                                <span className={`text-sm text-gray-900 ${!msg.isRead ? 'font-semibold' : 'font-medium'}`}>{msg.name}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 truncate">{msg.subject}</p>
                                        <p className="text-xs text-gray-400 truncate mt-0.5">{msg.message}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                <button disabled={pagination.page === 1} onClick={() => fetchMessages(pagination.page - 1)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition">
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <span className="text-sm text-gray-500 flex items-center px-2">{pagination.page} / {pagination.pages}</span>
                                <button disabled={pagination.page === pagination.pages} onClick={() => fetchMessages(pagination.page + 1)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition">
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Message Detail */}
                    {selected ? (
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                            {/* Detail Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <button onClick={() => setSelected(null)} className="md:hidden text-gray-400 hover:text-gray-600 mr-1">
                                            <i className="fas fa-arrow-left"></i>
                                        </button>
                                        <h3 className="text-lg font-bold text-gray-900">{selected.subject}</h3>
                                        {selected.isRead ? (
                                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                                <i className="fas fa-check-circle text-xs"></i> Read
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                                <i className="fas fa-clock text-xs"></i> Unread
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {new Date(selected.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDeleteConfirm(selected._id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                >
                                    <i className="fas fa-trash text-xs"></i> Delete
                                </button>
                            </div>

                            {/* Sender Info */}
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                                <div className="flex flex-wrap gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">
                                            {selected.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">From</p>
                                            <p className="text-sm font-semibold text-gray-900">{selected.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-envelope text-gray-400 text-sm"></i>
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <a href={`mailto:${selected.email}`} className="text-sm font-medium text-indigo-600 hover:underline">{selected.email}</a>
                                        </div>
                                    </div>
                                    {selected.phone && (
                                        <div className="flex items-center gap-2">
                                            <i className="fas fa-phone text-gray-400 text-sm"></i>
                                            <div>
                                                <p className="text-xs text-gray-500">Phone</p>
                                                <p className="text-sm font-medium text-gray-900">{selected.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message Body */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                            </div>

                            {/* Reply Footer */}
                            <div className="p-4 border-t border-gray-100 space-y-3">
                                <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder={`Write a reply to ${selected.name}...`}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                />
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleReply}
                                        disabled={!replyText.trim() || replying}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {replying ? (
                                            <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> Sending...</>
                                        ) : (
                                            <><i className="fas fa-paper-plane"></i> Send Reply</>
                                        )}
                                    </button>
                                    <span className="text-xs text-gray-400">Will be sent to {selected.email}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Empty state placeholder (desktop) */
                        <div className="hidden md:flex flex-1 items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 flex-col gap-3">
                            <i className="fas fa-envelope-open text-5xl opacity-20"></i>
                            <p className="text-sm">Select a message to read</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="text-center">
                            <i className="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
                            <h3 className="text-xl font-semibold mb-2">Confirm Delete</h3>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete this message? This cannot be undone.</p>
                            <div className="flex justify-center space-x-4">
                                <button onClick={() => setDeleteConfirm(null)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}