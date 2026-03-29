import React from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-react';
import AccountLayout from '../components/Account/AccountLayout';
import { accountPageCopy } from '../constants/accountMenu';
import { openLoginModal } from '../redux/authSlice';

export default function AccountPlaceholderPage() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const pageContent = accountPageCopy[location.pathname] || {
    title: 'Account',
    description: 'This account section is coming soon.',
    heading: 'Coming soon.',
    body: 'This section is under development.',
    features: [],
  };

  return (
    <AccountLayout title={pageContent.title} description={pageContent.description}>
      {!isAuthenticated ? (
        <div className="rounded-[28px] border border-blue-100 bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_100%)] p-8 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-flipblue shadow-sm">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-2xl font-bold text-slate-900">Login required</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Sign in to access {pageContent.title}. Your data is saved securely to your account.
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
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
          {/* Left: section-specific content */}
          <div className="rounded-[28px] border border-slate-100 bg-slate-50/70 p-8">
            <h3 className="text-2xl font-bold text-slate-900">{pageContent.heading}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{pageContent.body}</p>

            {pageContent.features?.length > 0 && (
              <ul className="mt-6 space-y-2.5">
                {pageContent.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-flipgreen" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: signed-in user info */}
          <div className="rounded-[28px] border border-slate-100 bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Signed in as</p>
            <h4 className="mt-4 text-xl font-bold text-slate-900">{user?.name}</h4>
            <p className="mt-2 text-sm text-slate-500">{user?.email}</p>
            {user?.phone && <p className="mt-1 text-sm text-slate-500">{user.phone}</p>}
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
