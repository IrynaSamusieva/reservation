import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './AdminPanel.module.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

const statusLabels = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected' };
const statusColors = { PENDING: '#b8860b', APPROVED: '#2e7d32', REJECTED: '#c62828' };

function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return { Authorization: `Bearer ${token}` };
}


function RoomFormModal({ room, onClose, onSaved }) {
    const isEdit = Boolean(room?.id);
    const [form, setForm] = useState({
        roomNumber: room?.roomNumber || '',
        name: room?.name || '',
        description: room?.description || '',
        capacity: room?.capacity || 1,
        pricePerNight: room?.pricePerNight || '',
        imageUrl: room?.imageUrl || '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                ...form,
                capacity: Number(form.capacity),
                pricePerNight: Number(form.pricePerNight),
            };
            if (isEdit) {
                await axios.put(`${API_BASE}/rooms/${room.id}`, payload, { headers: getAuthHeaders() });
            } else {
                await axios.post(`${API_BASE}/rooms`, payload, { headers: getAuthHeaders() });
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save room');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{isEdit ? 'Edit Room' : 'Add New Room'}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className={styles.roomForm}>
                    <div className={styles.formGrid}>
                        <label className={styles.formLabel}>
                            Room Number *
                            <input className={styles.formInput} name="roomNumber" value={form.roomNumber} onChange={handleChange} required />
                        </label>
                        <label className={styles.formLabel}>
                            Capacity *
                            <input className={styles.formInput} name="capacity" type="number" min="1" value={form.capacity} onChange={handleChange} required />
                        </label>
                        <label className={styles.formLabel} style={{ gridColumn: '1 / -1' }}>
                            Name *
                            <input className={styles.formInput} name="name" value={form.name} onChange={handleChange} required />
                        </label>
                        <label className={styles.formLabel} style={{ gridColumn: '1 / -1' }}>
                            Description *
                            <textarea className={styles.formInput} name="description" rows={3} value={form.description} onChange={handleChange} required />
                        </label>
                        <label className={styles.formLabel}>
                            Price per night (\$) *
                            <input className={styles.formInput} name="pricePerNight" type="number" step="0.01" min="0.01" value={form.pricePerNight} onChange={handleChange} required />
                        </label>
                        <label className={styles.formLabel}>
                            Image URL
                            <input className={styles.formInput} name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
                        </label>
                    </div>
                    {error && <p className={styles.errorText}>{error}</p>}
                    <div className={styles.modalActions}>
                        <button type="button" className={styles.btnOutline} onClick={onClose}>Cancel</button>
                        <button type="submit" className={styles.btnPrimary} disabled={saving}>
                            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Room'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <div className={styles.modalOverlay} onClick={onCancel}>
            <div className={styles.confirmDialog} onClick={e => e.stopPropagation()}>
                <p className={styles.confirmMessage}>{message}</p>
                <div className={styles.modalActions}>
                    <button className={styles.btnOutline} onClick={onCancel}>Cancel</button>
                    <button className={styles.btnDanger} onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main AdminPanel ───────────────────────────────────────── */

function AdminPanel() {
    const [tab, setTab] = useState('reservations');
    const [reservations, setReservations] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loadingRes, setLoadingRes] = useState(true);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [resError, setResError] = useState('');
    const [roomsError, setRoomsError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [roomModal, setRoomModal] = useState(null); // null | 'new' | roomObject
    const [confirmDialog, setConfirmDialog] = useState(null); // null | { message, onConfirm }
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    /* ── Data fetching ── */
    const fetchReservations = useCallback(async () => {
        setLoadingRes(true);
        setResError('');
        try {
            const res = await axios.get(`${API_BASE}/reservation/all`, { headers: getAuthHeaders() });
            setReservations(res.data || []);
        } catch (err) {
            setResError('Failed to load reservations.');
        } finally {
            setLoadingRes(false);
        }
    }, []);

    const fetchRooms = useCallback(async () => {
        setLoadingRooms(true);
        setRoomsError('');
        try {
            const res = await axios.get(`${API_BASE}/rooms/all`, { headers: getAuthHeaders() });
            setRooms(res.data || []);
        } catch (err) {
            setRoomsError('Failed to load rooms.');
        } finally {
            setLoadingRooms(false);
        }
    }, []);

    useEffect(() => { fetchReservations(); }, [fetchReservations]);
    useEffect(() => { fetchRooms(); }, [fetchRooms]);

    /* ── Reservation actions ── */
    const handleApprove = async (id) => {
        setActionLoading(id + '_approve');
        try {
            await axios.post(`${API_BASE}/reservation/${id}/approve`, {}, { headers: getAuthHeaders() });
            await fetchReservations();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to approve reservation.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = (id) => {
        setConfirmDialog({
            message: `Reject reservation #${id}?`,
            onConfirm: async () => {
                setConfirmDialog(null);
                setActionLoading(id + '_reject');
                try {
                    await axios.delete(`${API_BASE}/reservation/${id}/reject`, { headers: getAuthHeaders() });
                    await fetchReservations();
                } catch (err) {
                    alert(err.response?.data?.message || 'Failed to reject reservation.');
                } finally {
                    setActionLoading(null);
                }
            }
        });
    };

    /* ── Room actions ── */
    const handleDeleteRoom = (room) => {
        setConfirmDialog({
            message: `Deactivate room "${room.name}" (${room.roomNumber})? It will no longer appear in the catalog.`,
            onConfirm: async () => {
                setConfirmDialog(null);
                try {
                    await axios.delete(`${API_BASE}/rooms/${room.id}`, { headers: getAuthHeaders() });
                    await fetchRooms();
                } catch (err) {
                    alert(err.response?.data?.message || 'Failed to delete room.');
                }
            }
        });
    };

    /* ── Filtered reservations ── */
    const filteredReservations = reservations.filter(r => {
        const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
        const q = searchQuery.toLowerCase();
        const matchSearch = !q
            || r.userName?.toLowerCase().includes(q)
            || r.roomName?.toLowerCase().includes(q)
            || String(r.id).includes(q);
        return matchStatus && matchSearch;
    });

    /* ── Stats ── */
    const stats = {
        total: reservations.length,
        pending: reservations.filter(r => r.status === 'PENDING').length,
        approved: reservations.filter(r => r.status === 'APPROVED').length,
        rejected: reservations.filter(r => r.status === 'REJECTED').length,
        activeRooms: rooms.filter(r => r.active).length,
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        window.location.assign('/');
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <a className={styles.brand} href="/reservation">Quiet Shore</a>
                <nav className={styles.nav}>
                    <a href="/reservation">Rooms</a>
                    <span className={styles.activeLink}>Admin Panel</span>
                </nav>
                <button className={styles.logout} type="button" onClick={handleLogout}>Log out</button>
            </header>

            <main className={styles.main}>
                <div className={styles.pageTitle}>
                    <h1>Admin Panel</h1>
                    <p className={styles.subtitle}>Manage reservations and rooms</p>
                </div>

                {/* Stats */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{stats.total}</span>
                        <span className={styles.statLabel}>Total Reservations</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.statPending}`}>
                        <span className={styles.statNumber}>{stats.pending}</span>
                        <span className={styles.statLabel}>Pending</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.statApproved}`}>
                        <span className={styles.statNumber}>{stats.approved}</span>
                        <span className={styles.statLabel}>Approved</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.statRejected}`}>
                        <span className={styles.statNumber}>{stats.rejected}</span>
                        <span className={styles.statLabel}>Rejected</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.statRooms}`}>
                        <span className={styles.statNumber}>{stats.activeRooms}</span>
                        <span className={styles.statLabel}>Active Rooms</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button
                        className={tab === 'reservations' ? styles.tabActive : styles.tab}
                        onClick={() => setTab('reservations')}
                    >
                        Reservations
                    </button>
                    <button
                        className={tab === 'rooms' ? styles.tabActive : styles.tab}
                        onClick={() => setTab('rooms')}
                    >
                        Rooms
                    </button>
                </div>

                {/* ── Reservations Tab ── */}
                {tab === 'reservations' && (
                    <section className={styles.section}>
                        <div className={styles.sectionToolbar}>
                            <div className={styles.filters}>
                                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(s => (
                                    <button
                                        key={s}
                                        className={filterStatus === s ? styles.filterActive : styles.filterBtn}
                                        onClick={() => setFilterStatus(s)}
                                    >
                                        {s === 'ALL' ? 'All' : statusLabels[s]}
                                        {s !== 'ALL' && (
                                            <span className={styles.filterCount}>{reservations.filter(r => r.status === s).length}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <input
                                className={styles.searchInput}
                                placeholder="Search by guest, room or ID..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <button className={styles.refreshBtn} onClick={fetchReservations}>↻ Refresh</button>
                        </div>

                        {resError && <p className={styles.errorText}>{resError}</p>}

                        {loadingRes ? (
                            <div className={styles.loadingBox}><div className={styles.spinner} /><p>Loading reservations...</p></div>
                        ) : filteredReservations.length === 0 ? (
                            <div className={styles.emptyState}>No reservations found.</div>
                        ) : (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Guest</th>
                                            <th>Room</th>
                                            <th>Check-in</th>
                                            <th>Check-out</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReservations.map(r => (
                                            <tr key={r.id}>
                                                <td className={styles.idCell}>#{r.id}</td>
                                                <td>{r.userName || `User #${r.userId}`}</td>
                                                <td>
                                                    <span className={styles.roomCell}>
                                                        {r.roomName || `Room #${r.roomId}`}
                                                        {r.roomNumber && <span className={styles.roomNum}> №{r.roomNumber}</span>}
                                                    </span>
                                                </td>
                                                <td>{r.startDate}</td>
                                                <td>{r.endDate}</td>
                                                <td>
                                                    <span className={styles.badge} style={{ background: statusColors[r.status] || '#888' }}>
                                                        {statusLabels[r.status] || r.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.actionBtns}>
                                                        {r.status === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    className={styles.btnApprove}
                                                                    disabled={actionLoading === r.id + '_approve'}
                                                                    onClick={() => handleApprove(r.id)}
                                                                >
                                                                    {actionLoading === r.id + '_approve' ? '...' : '✓ Approve'}
                                                                </button>
                                                                <button
                                                                    className={styles.btnReject}
                                                                    disabled={actionLoading === r.id + '_reject'}
                                                                    onClick={() => handleReject(r.id)}
                                                                >
                                                                    {actionLoading === r.id + '_reject' ? '...' : '✕ Reject'}
                                                                </button>
                                                            </>
                                                        )}
                                                        {r.status !== 'PENDING' && (
                                                            <span className={styles.noAction}>—</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* ── Rooms Tab ── */}
                {tab === 'rooms' && (
                    <section className={styles.section}>
                        <div className={styles.sectionToolbar}>
                            <span className={styles.sectionCount}>{rooms.length} rooms total</span>
                            <button className={styles.refreshBtn} onClick={fetchRooms}>↻ Refresh</button>
                            <button className={styles.btnPrimary} onClick={() => setRoomModal('new')}>+ Add Room</button>
                        </div>

                        {roomsError && <p className={styles.errorText}>{roomsError}</p>}

                        {loadingRooms ? (
                            <div className={styles.loadingBox}><div className={styles.spinner} /><p>Loading rooms...</p></div>
                        ) : rooms.length === 0 ? (
                            <div className={styles.emptyState}>No rooms found.</div>
                        ) : (
                            <div className={styles.tableWrapper}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>№</th>
                                            <th>Name</th>
                                            <th>Capacity</th>
                                            <th>Price / night</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rooms.map(room => (
                                            <tr key={room.id} className={!room.active ? styles.inactiveRow : ''}>
                                                <td className={styles.idCell}>{room.roomNumber}</td>
                                                <td>{room.name}</td>
                                                <td>{room.capacity} guest{room.capacity !== 1 ? 's' : ''}</td>
                                                <td>\${Number(room.pricePerNight).toFixed(2)}</td>
                                                <td>
                                                    <span className={styles.badge} style={{ background: room.active ? '#2e7d32' : '#888' }}>
                                                        {room.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className={styles.actionBtns}>
                                                        <button className={styles.btnEdit} onClick={() => setRoomModal(room)}>Edit</button>
                                                        {room.active && (
                                                            <button className={styles.btnReject} onClick={() => handleDeleteRoom(room)}>Deactivate</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
            </main>

            {/* Room modal */}
            {roomModal && (
                <RoomFormModal
                    room={roomModal === 'new' ? null : roomModal}
                    onClose={() => setRoomModal(null)}
                    onSaved={() => { setRoomModal(null); fetchRooms(); }}
                />
            )}

            {/* Confirm dialog */}
            {confirmDialog && (
                <ConfirmDialog
                    message={confirmDialog.message}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog(null)}
                />
            )}
        </div>
    );
}

export default AdminPanel;
