 "use client";

import { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SubscriptionStepper } from '@/components/SubscriptionStepper';
import { SubscriptionActions } from '@/components/SubscriptionActions';
import { SubscriptionState } from '@/lib/state/subscriptionMachine'; // <-- Import State Type

const PLAN_TEMPLATES = [
  { id: 'tpl-1', name: 'Pro SaaS Plan', validityDays: 14, lines: [{ product: 'Pro License', qty: 1, price: 99.00 }] },
  { id: 'tpl-2', name: 'Enterprise Annual', validityDays: 30, lines: [{ product: 'Enterprise License', qty: 10, price: 999.00 }] }
];

function SubscriptionContent() {
  const params = useParams();
  const router = useRouter();

  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [lines, setLines] = useState([{ product: '', qty: 1, price: 0 }]);

  if (!params || !params.id) return null;

  const id = params.id as string;
  const isNew = id === 'new';
  
  // NEW: Convert status to a state variable so the stepper can update dynamically
  const [currentStatus, setCurrentStatus] = useState<SubscriptionState>(isNew ? 'Draft' : 'Active'); 
  const mockPlanFlags = { allowPause: true, allowEarlyClose: true };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = PLAN_TEMPLATES.find(t => t.id === e.target.value);
    
    if (template) {
      setLines(template.lines);
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + template.validityDays);
      setExpiryDate(expiry);
    } else {
      setLines([{ product: '', qty: 1, price: 0 }]);
      setExpiryDate(null);
    }
  };

  const handleLineChange = (index: number, field: 'product' | 'qty' | 'price', value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const handleSave = () => {
    // Transition to the 2nd stage
    setCurrentStatus('Quotation');
    console.log("Quotation Generated:", { expiryDate, lines });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <SubscriptionStepper currentStatus={currentStatus} />
      
      <div className="bg-[#0f111a] p-6 rounded-xl shadow-sm border border-slate-800 mt-8">
        <h2 className="text-lg font-semibold mb-6 text-white">
          {isNew ? 'Create New Quotation' : `Subscription Details: ${id}`}
        </h2>

        {/* Hide template dropdown once it moves past Draft */}
        {currentStatus === 'Draft' && (
          <div className="mb-8 p-4 border border-indigo-500/30 bg-indigo-500/10 rounded-lg">
            <label className="block text-sm font-medium text-indigo-400 mb-2">
              Use Template (Auto-fills Quotation & Expiry)
            </label>
            <select 
              onChange={handleTemplateChange}
              className="w-full border border-slate-700 bg-slate-800 text-white p-2 rounded-md focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Select a Plan Template --</option>
              {PLAN_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} (Valid for {t.validityDays} days)
                </option>
              ))}
            </select>
            {expiryDate && (
              <p className="text-xs text-indigo-300 mt-2">
                Calculated Expiry: {expiryDate.toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-4 mb-4 font-medium text-sm text-slate-400 border-b border-slate-800 pb-2">
          <div className="col-span-2">Product</div>
          <div>Qty</div>
          <div>Unit Price</div>
        </div>
        
        {lines.map((line, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 items-center mb-4">
            <input 
              type="text" 
              value={line.product}
              onChange={(e) => handleLineChange(index, 'product', e.target.value)}
              readOnly={currentStatus !== 'Draft' && line.product !== ''}
              placeholder="Select Product..." 
              className="col-span-2 border border-slate-700 bg-slate-800 text-white p-2 rounded-md focus:outline-none focus:border-indigo-500 placeholder-slate-500" 
            />
            <input 
              type="number" 
              value={line.qty}
              onChange={(e) => handleLineChange(index, 'qty', Number(e.target.value))}
              readOnly={currentStatus !== 'Draft'}
              className="border border-slate-700 bg-slate-800 text-white p-2 rounded-md focus:outline-none focus:border-indigo-500" 
            />
            <input 
              type="number" 
              value={line.price}
              onChange={(e) => handleLineChange(index, 'price', Number(e.target.value))}
              readOnly={currentStatus !== 'Draft'}
              placeholder="0.00" 
              className="border border-slate-700 bg-slate-800 text-white p-2 rounded-md focus:outline-none focus:border-indigo-500 placeholder-slate-500" 
            />
          </div>
        ))}

        <div className="border-t border-slate-800 pt-4 mt-8 flex justify-between items-center">
          <SubscriptionActions status={currentStatus} plan={mockPlanFlags} />
          
          {/* Change button based on state */}
          {currentStatus === 'Draft' && (
            <button 
              onClick={handleSave} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium text-sm transition-colors ml-auto"
            >
              Save Quotation
            </button>
          )}
          
          {currentStatus === 'Quotation' && (
            <button 
              onClick={() => setCurrentStatus('Confirmed')} 
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium text-sm transition-colors ml-auto"
            >
              Confirm Quotation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionDetail() {
  return (
    <Suspense fallback={
      <div className="p-8 max-w-4xl mx-auto w-full flex justify-center items-center h-64 text-slate-400">
        Loading subscription form...
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}