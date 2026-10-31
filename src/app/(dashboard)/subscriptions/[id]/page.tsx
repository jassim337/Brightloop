"use client";

import { useState, Suspense, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// 6-stage lifecycle matching your exact stepper UI
const SUBSCRIPTION_STATES = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Paused', 'Closed'] as const;
type SubscriptionState = typeof SUBSCRIPTION_STATES[number];

const PLAN_TEMPLATES = [
  { id: 'tpl-1', name: 'Pro SaaS Plan', validityDays: 14, lines: [{ product: 'Pro License', variant: 'Monthly', qty: 1, price: 99.00, tax: 10, amount: 108.90 }] },
  { id: 'tpl-2', name: 'Enterprise Annual', validityDays: 30, lines: [{ product: 'Enterprise License', variant: 'Annual', qty: 10, price: 999.00, tax: 5, amount: 10489.50 }] }
];

function PureStepper({ currentStatus }: { currentStatus: SubscriptionState }) {
  const currentIndex = SUBSCRIPTION_STATES.indexOf(currentStatus);

  return (
    <div className="flex items-center justify-between w-full p-6 mb-12 rounded-xl bg-slate-900/50 border border-slate-800 shadow-sm font-sans">
      {SUBSCRIPTION_STATES.map((state, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={state} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-colors duration-300 ring-4 ring-[#0f111a]",
                  isActive ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]" :
                    isCompleted ? "bg-indigo-500/20 text-indigo-400" :
                      "bg-slate-800 text-slate-500"
                )}
              >
                {index + 1}
              </div>
              <span className={cn(
                "absolute top-12 text-xs font-medium tracking-wide whitespace-nowrap",
                isActive || isCompleted ? "text-indigo-400" : "text-slate-500"
              )}>
                {state}
              </span>
            </div>
            {index < SUBSCRIPTION_STATES.length - 1 && (
              <div className={cn(
                "h-[2px] w-full mx-2 rounded-full",
                index < currentIndex ? "bg-indigo-500/40" : "bg-slate-800"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SubscriptionContent() {
  const params = useParams();
  const router = useRouter();

  const [startDate] = useState<Date>(new Date());
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<Date | null>(null);
  const [lines, setLines] = useState([{ product: 'Pro License', variant: 'Monthly', qty: 1, price: 99.00, tax: 10, amount: 108.90 }]);

  if (!params || !params.id) return null;

  const id = params.id as string;
  const isNew = id === 'new';

  const [currentStatus, setCurrentStatus] = useState<SubscriptionState>('Draft');

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = PLAN_TEMPLATES.find(t => t.id === e.target.value);
    if (template) {
      setLines(template.lines);
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + template.validityDays);
      setExpiryDate(expiry);
    } else {
      setLines([{ product: '', variant: '', qty: 1, price: 0, tax: 0, amount: 0 }]);
      setExpiryDate(null);
    }
  };

  const handleLineChange = (index: number, field: string, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };

    if (['qty', 'price', 'tax'].includes(field)) {
      const qty = Number(newLines[index].qty) || 0;
      const price = Number(newLines[index].price) || 0;
      const tax = Number(newLines[index].tax) || 0;
      const subtotal = qty * price;
      const taxAmount = subtotal * (tax / 100);
      newLines[index].amount = Number((subtotal + taxAmount).toFixed(2));
    }

    setLines(newLines);
  };

  const addLine = () => setLines([...lines, { product: '', variant: '', qty: 1, price: 0, tax: 0, amount: 0 }]);

  const grandTotal = useMemo(() => {
    return lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  }, [lines]);

  const handleBack = () => {
    if (currentStatus === 'Draft') router.push('/subscriptions');
    else if (currentStatus === 'Quotation') setCurrentStatus('Draft');
    else if (currentStatus === 'Confirmed') setCurrentStatus('Quotation');
    else if (currentStatus === 'Active') setCurrentStatus('Confirmed');
    else if (currentStatus === 'Paused') setCurrentStatus('Active');
    else if (currentStatus === 'Closed') setCurrentStatus('Active');
  };

  const handleAdvance = () => {
    if (currentStatus === 'Draft') setCurrentStatus('Quotation');
    else if (currentStatus === 'Quotation') setCurrentStatus('Confirmed');
    else if (currentStatus === 'Confirmed') {
      setCurrentStatus('Active');
      setNextBillingDate(startDate);
    }
    else if (currentStatus === 'Active') setCurrentStatus('Paused');
    else if (currentStatus === 'Paused') setCurrentStatus('Closed');
  };

  const isReadOnly = currentStatus !== 'Draft';

  return (
    <div className="p-8 max-w-5xl mx-auto w-full text-slate-100">
      <PureStepper currentStatus={currentStatus} />

      <div className="bg-[#0f111a] p-6 rounded-xl shadow-sm border border-slate-800 mt-8">

        <div className="flex items-center gap-3 mb-6">
          <button type="button" onClick={handleBack} className="p-1.5 bg-slate-800/50 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors border border-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-white">
            {currentStatus === 'Draft' ? 'Create New Quotation' : `Subscription Stage: ${currentStatus}`}
          </h2>
        </div>

        {(currentStatus === 'Active' || currentStatus === 'Paused') && (
          <div className="mb-8 p-4 border border-blue-500/30 bg-blue-500/10 rounded-lg flex gap-8">
            <div>
              <p className="text-xs text-blue-400 mb-1 tracking-wider uppercase font-semibold">Start Date</p>
              <p className="text-white font-medium">{startDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 mb-1 tracking-wider uppercase font-semibold">Next Billing Date</p>
              <p className="text-white font-medium">{nextBillingDate?.toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {currentStatus === 'Draft' && (
          <div className="mb-8 p-4 border border-indigo-500/30 bg-indigo-500/10 rounded-lg">
            <label className="block text-sm font-medium text-indigo-400 mb-2">Use Template (Auto-fills Quotation & Expiry)</label>
            <select onChange={handleTemplateChange} className="w-full border border-slate-700 bg-slate-800 text-white p-2 rounded-md focus:outline-none focus:border-indigo-500">
              <option value="">-- Select a Plan Template --</option>
              {PLAN_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name} (Valid for {t.validityDays} days)</option>
              ))}
            </select>
            {expiryDate && <p className="text-xs text-indigo-300 mt-2">Calculated Expiry: {expiryDate.toLocaleDateString()}</p>}
          </div>
        )}

        <div className="grid grid-cols-7 gap-4 mb-4 font-medium text-sm text-slate-400 border-b border-slate-800 pb-2">
          <div className="col-span-2">Product</div><div>Variant</div><div>Qty</div><div>Unit Price</div><div>Tax (%)</div><div>Amount</div>
        </div>

        {lines.map((line, index) => (
          <div key={index} className="grid grid-cols-7 gap-4 items-center mb-4">
            <input type="text" value={line.product} onChange={(e) => handleLineChange(index, 'product', e.target.value)} readOnly={isReadOnly} placeholder="Select Product..." className="col-span-2 border border-slate-700 bg-slate-800 text-white p-2 rounded-md focus:outline-none focus:border-indigo-500 placeholder-slate-500" />
            <input type="text" value={line.variant} onChange={(e) => handleLineChange(index, 'variant', e.target.value)} readOnly={isReadOnly} placeholder="Variant..." className="border border-slate-700 bg-slate-800 text-white p-2 rounded-md focus:outline-none focus:border-indigo-500 placeholder-slate-500" />
            <input type="number" value={line.qty} onChange={(e) => handleLineChange(index, 'qty', Number(e.target.value))} readOnly={isReadOnly} className="border border-slate-700 bg-slate-800 text-white p-2 rounded-md focus:outline-none focus:border-indigo-500" />
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">$</span>
              <input type="number" value={line.price} onChange={(e) => handleLineChange(index, 'price', Number(e.target.value))} readOnly={isReadOnly} className="w-full border border-slate-700 bg-slate-800 text-white p-2 pl-7 rounded-md focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="relative">
              <input type="number" value={line.tax} onChange={(e) => handleLineChange(index, 'tax', Number(e.target.value))} readOnly={isReadOnly} className="w-full border border-slate-700 bg-slate-800 text-white p-2 pr-7 rounded-md focus:outline-none focus:border-indigo-500" />
              <span className="absolute right-3 top-2.5 text-slate-500">%</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">$</span>
              <input type="number" value={line.amount} readOnly className="w-full border border-slate-700 bg-slate-900 text-slate-300 p-2 pl-7 rounded-md focus:outline-none cursor-not-allowed" />
            </div>
          </div>
        ))}

        {currentStatus === 'Draft' && (
          <button type="button" onClick={addLine} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium mb-6">+ Add another line</button>
        )}

        <div className="flex justify-end border-t border-slate-800 pt-4 mb-8">
          <div className="text-right">
            <p className="text-sm text-slate-400 mb-1">Grand Total</p>
            <p className="text-2xl font-bold text-white">${grandTotal.toFixed(2)}</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
          <div className="flex gap-3">
            {currentStatus === 'Active' && (
              <button type="button" onClick={() => setCurrentStatus('Paused')} className="px-3 py-1.5 bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded-md text-xs font-medium hover:bg-amber-600/30 transition-colors">
                Pause Subscription
              </button>
            )}
            {currentStatus === 'Active' && (
              <button type="button" onClick={() => setCurrentStatus('Closed')} className="px-3 py-1.5 bg-rose-600/20 text-rose-400 border border-rose-600/30 rounded-md text-xs font-medium hover:bg-rose-600/30 transition-colors">
                Close Early
              </button>
            )}
          </div>

          <div className="ml-auto">
            {currentStatus === 'Draft' && (
              <button type="button" onClick={handleAdvance} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium text-sm transition-colors">
                Save Quotation
              </button>
            )}
            {currentStatus === 'Quotation' && (
              <button type="button" onClick={handleAdvance} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium text-sm transition-colors">
                Confirm Quotation
              </button>
            )}
            {currentStatus === 'Confirmed' && (
              <button type="button" onClick={handleAdvance} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm transition-colors">
                Activate Subscription
              </button>
            )}
            {currentStatus === 'Active' && (
              <button type="button" onClick={handleAdvance} className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 font-medium text-sm transition-colors">
                Pause Subscription
              </button>
            )}
            {currentStatus === 'Paused' && (
              <button type="button" onClick={handleAdvance} className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 font-medium text-sm transition-colors">
                Close Subscription
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionDetail() {
  return (
    <Suspense fallback={<div className="p-8 max-w-4xl mx-auto w-full flex justify-center items-center h-64 text-slate-400">Loading form...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
}