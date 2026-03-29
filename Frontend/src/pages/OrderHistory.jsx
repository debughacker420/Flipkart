import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowRight, LockKeyhole, PackageSearch, RefreshCw, ShoppingBag, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import AccountLayout from '../components/Account/AccountLayout';
import { getOrders } from '../services/api';
import { openLoginModal } from '../redux/authSlice';
import { formatDate, formatPrice } from '../utils/formatPrice';

const statusToneMap = {
  placed: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-sky-50 text-sky-700',
  processing: 'bg-amber-50 text-amber-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  out_for_delivery: 'bg-violet-50 text-violet-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-rose-50 text-rose-700',
  returned: 'bg-slate-100 text-slate-700',
};

const formatStatusLabel = (status) =>
  (status || 'placed')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function OrderHistory() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getOrders();
      setOrders(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setOrders([]);
      return;
    }

    loadOrders();
  }, [isAuthenticated]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!isAuthenticated) {
    return (
      <AccountLayout
        title="Orders"
        description="Track current deliveries and revisit your past purchases from one place."
      >
        <div className="rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_100%)] p-8 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-flipblue shadow-sm">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-2xl font-bold text-slate-900">Login to view order history</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Orders are tied to your account now, so we need you signed in before we can show deliveries and past purchases.
          </p>
          <button
            type="button"
            onClick={() => dispatch(openLoginModal('login'))}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-flipblue px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Login to continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout
      title="Orders"
      description="Track current deliveries and revisit your past purchases from one place."
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-[24px] border border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Order History</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
            </h2>
          </div>
          <button
            type="button"
            onClick={async () => {
              await loadOrders();
              toast.success('Orders refreshed');
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="flex min-h-[260px] items-center justify-center rounded-[28px] border border-slate-100 bg-white">
            <div className="h-10 w-10 rounded-full border-4 border-flipblue border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[28px] border border-rose-100 bg-rose-50 p-8">
            <h3 className="text-xl font-bold text-rose-700">Couldn&apos;t load your orders</h3>
            <p className="mt-3 text-sm leading-6 text-rose-600">{error}</p>
            <button
              type="button"
              onClick={loadOrders}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="rounded-[28px] border border-slate-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-flipblue">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-slate-900">No orders yet</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Once you place an order, it will show up here with item summaries, delivery details, and current status.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-flipblue px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Start shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {!loading &&
          !error &&
          orders.map((order) => (
            <article
              key={order.id}
              className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Order #{order.id.slice(0, 8)}</p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">{formatDate(order.placedAt)}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                    {order.addressCity ? ` • ${order.addressCity}` : ''}
                    {order.addressState ? `, ${order.addressState}` : ''}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                      statusToneMap[order.status] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {formatStatusLabel(order.status)}
                  </span>
                  <span className="text-lg font-bold text-slate-900">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {(order.items || []).map((item, index) => (
                    <div
                      key={`${order.id}-${item.title}-${index}`}
                      className="flex items-start gap-4 rounded-[22px] border border-slate-100 bg-slate-50/60 p-4"
                    >
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-2">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="h-full w-full object-contain" />
                        ) : (
                          <PackageSearch className="h-8 w-8 text-slate-300" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold leading-6 text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-500">Qty: {item.quantity}</p>
                        <p className="mt-2 text-sm font-bold text-slate-900">{formatPrice(item.unitPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-3 rounded-[22px] bg-[#f8fbff] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Truck className="h-4 w-4 text-flipblue" />
                    <span>
                      Payment: <span className="font-semibold text-slate-900">{order.paymentMethod}</span>
                    </span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span>
                      Payment Status: <span className="font-semibold text-slate-900">{formatStatusLabel(order.paymentStatus)}</span>
                    </span>
                  </div>

                  <Link
                    to={`/order-confirmation/${order.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-flipblue transition hover:text-blue-700"
                  >
                    View order summary
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
      </div>
    </AccountLayout>
  );
}
