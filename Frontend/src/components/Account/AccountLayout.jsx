import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronRight } from 'lucide-react';
import { accountMenuItems } from '../../constants/accountMenu';
import { logout, openLoginModal } from '../../redux/authSlice';

export default function AccountLayout({ title, description, children }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleProtectedAction = (event, item) => {
    if (item.isLogout) {
      event.preventDefault();
      dispatch(logout());
      return;
    }

    if (!isAuthenticated) {
      event.preventDefault();
      dispatch(openLoginModal('login'));
    }
  };

  return (
    <div className="bg-[#f1f3f6] px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-5 lg:flex-row">
        <aside className="w-full shrink-0 overflow-hidden rounded-[26px] bg-white shadow-sm lg:w-[300px]">
          <div className="bg-[linear-gradient(135deg,#0b5cff_0%,#2f8dff_100%)] px-6 py-7 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/75">Your Account</p>
            <h2 className="mt-3 text-2xl font-bold">{isAuthenticated ? user?.name || 'Flipkart User' : 'Guest'}</h2>
            <p className="mt-2 text-sm text-white/80">
              {isAuthenticated ? user?.email : 'Login to access your profile, orders, and saved preferences.'}
            </p>
          </div>

          <nav className="p-3">
            {accountMenuItems.map((item) => {
              const Icon = item.icon;

              if (item.isLogout) {
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={(event) => handleProtectedAction(event, item)}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-rose-600"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={(event) => handleProtectedAction(event, item)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive && isAuthenticated
                        ? 'bg-blue-50 text-flipblue'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <section className="flex-1 overflow-hidden rounded-[26px] bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-7 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Account Section</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">{title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
          </div>

          <div className="px-6 py-8 sm:px-8">{children}</div>
        </section>
      </div>
    </div>
  );
}
