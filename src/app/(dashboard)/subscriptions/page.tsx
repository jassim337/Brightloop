import Link from 'next/link';

export default function SubscriptionsDashboard() {
  return (
    <div className="flex flex-col w-full h-full p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-sm text-slate-400">Monitor, filter, and manage all active customer recurring subscriptions.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-white border border-slate-700 rounded-md bg-slate-800 hover:bg-slate-700">
            Filter
          </button>
          
          {/* 
            The updated routing connection. 
            By using Next.js Link, this will now push the user to the [id] dynamic route 
            where 'new' acts as the id parameter. 
          */}
          <Link 
            href="/subscriptions/new" 
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            + Create Subscription
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full h-96 bg-[#0f111a] border border-slate-800 rounded-xl shadow-sm">
        <div className="w-12 h-12 mb-4 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Subscription Management Engine</h3>
        <p className="text-sm text-slate-400 max-w-md text-center mb-6">Full Prisma data models, Stripe webhook sync, and billing lifecycle controls will be integrated in Phase 1 & 2.</p>
        <span className="px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800 rounded-full">Phase 0 Architecture Ready</span>
      </div>
    </div>
  );
}