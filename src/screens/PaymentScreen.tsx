import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Lock, 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  Wallet, 
  Check 
} from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/mockData';
import { ScreenId } from '../components/layout/Navbar';

interface PaymentScreenProps {
  onSelectScreen: (screen: ScreenId) => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ onSelectScreen }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [paymentTab, setPaymentTab] = useState<'upi' | 'card' | 'netbanking' | 'wallets'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const planPrices = {
    monthly: 499,
    quarterly: 1299,
    yearly: 4999
  };

  const currentPrice = planPrices[selectedPlan];

  const handlePay = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onSelectScreen('influencer');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-3 flex items-center justify-between">
        <button 
          onClick={() => onSelectScreen('influencer')}
          className="btn-secondary text-xs font-bold py-1.5 px-3 rounded-full flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-extrabold flex items-center justify-center">
            ✦
          </div>
          <span className="text-lg font-black text-slate-900">Creavora</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
          <Lock className="w-3.5 h-3.5 text-purple-600" />
          <span>Secure Checkout</span>
        </div>
      </header>

      {/* Main Payment Container */}
      <main className="flex-1 p-4 sm:p-8 max-w-[1400px] mx-auto w-full">
        {isSuccess ? (
          <div className="card max-w-md mx-auto my-12 p-8 rounded-3xl text-center space-y-4 shadow-xl border-purple-200 bg-white">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Payment Successful! 🎉</h2>
            <p className="text-xs text-slate-500 font-medium">
              You are now subscribed to Ananya Sharma's Premium tier. Redirecting to exclusive content...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Creator Profile & What You Get */}
            <div className="lg:col-span-5 space-y-6">
              {/* Creator Summary Card */}
              <div className="card p-0 rounded-3xl overflow-hidden shadow-md">
                <div className="h-32 w-full overflow-hidden relative">
                  <img src={SAMPLE_IMAGES.ananyaCover} className="w-full h-full object-cover" />
                </div>
                <div className="p-5 pt-0 relative bg-white">
                  <div className="flex items-end gap-3 -mt-10 mb-3">
                    <div className="relative">
                      <img src={SAMPLE_IMAGES.ananya} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Ananya Sharma</h3>
                      <span className="text-xs text-slate-400 font-medium">@ananyasharma • Fashion Creator</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center p-2.5 rounded-xl bg-slate-50 text-xs font-bold">
                    <div><span className="text-slate-900 block">124</span><span className="text-[9px] text-slate-400 uppercase">Posts</span></div>
                    <div><span className="text-slate-900 block">21.3K</span><span className="text-[9px] text-slate-400 uppercase">Followers</span></div>
                    <div><span className="text-slate-900 block">4.8K</span><span className="text-[9px] text-slate-400 uppercase">Subscribers</span></div>
                    <div><span className="text-amber-500 block">5.0 ⭐</span><span className="text-[9px] text-slate-400 uppercase">Rating</span></div>
                  </div>
                </div>
              </div>

              {/* What You'll Get Card */}
              <div className="card p-5 rounded-3xl space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">What you'll get</h3>
                
                <div className="space-y-3 text-xs">
                  {[
                    { title: 'Exclusive Posts', desc: 'Access photos, videos & reels that I don\'t share anywhere else.' },
                    { title: 'Behind the Scenes', desc: 'Get a peek into my daily life and creative process.' },
                    { title: 'Live Chats', desc: 'Join live chats & priority replies from me.' },
                    { title: 'Early Access', desc: 'Be the first to watch my new videos and updates.' },
                    { title: 'Special Badges', desc: 'Get a special badge next to your name in comments.' },
                  ].map((perk, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">{perk.title}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{perk.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Cancel anytime • No hidden charges • Secure & private</span>
                </div>
              </div>
            </div>

            {/* Right Column: Plan Selection & Payment Method */}
            <div className="lg:col-span-7 space-y-6">
              {/* Choose Subscription Plan Header */}
              <div className="card p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  <h2 className="text-base font-black text-slate-900">Choose your subscription</h2>
                </div>
                <p className="text-xs text-slate-500 font-medium -mt-2">
                  Unlock exclusive content and connect more closely with Ananya.
                </p>

                {/* Plan Options Radios */}
                <div className="space-y-3">
                  {/* Plan 1 - Monthly */}
                  <div 
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between relative ${
                      selectedPlan === 'monthly'
                        ? 'border-purple-600 bg-purple-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-purple-200 bg-white'
                    }`}
                  >
                    <span className="absolute -top-2.5 right-4 bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      Most Popular
                    </span>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === 'monthly' ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
                      }`}>
                        {selectedPlan === 'monthly' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 block">Premium Monthly</span>
                        <span className="text-[11px] text-slate-400 font-medium">Billed monthly. Cancel anytime.</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-purple-700">₹499 <em className="not-italic text-xs font-normal text-slate-500">/ month</em></span>
                      <span className="text-[10px] text-emerald-600 font-bold block">Save ₹100</span>
                    </div>
                  </div>

                  {/* Plan 2 - 3 Months */}
                  <div 
                    onClick={() => setSelectedPlan('quarterly')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      selectedPlan === 'quarterly'
                        ? 'border-purple-600 bg-purple-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-purple-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === 'quarterly' ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
                      }`}>
                        {selectedPlan === 'quarterly' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 block">Premium 3 Months</span>
                        <span className="text-[11px] text-slate-400 font-medium">₹433 / month (billed every 3 months)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-purple-700">₹1,299 <em className="not-italic text-xs font-normal text-slate-500">/ 3 months</em></span>
                      <span className="text-[10px] text-emerald-600 font-bold block">Save ₹198</span>
                    </div>
                  </div>

                  {/* Plan 3 - Yearly */}
                  <div 
                    onClick={() => setSelectedPlan('yearly')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      selectedPlan === 'yearly'
                        ? 'border-purple-600 bg-purple-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-purple-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === 'yearly' ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
                      }`}>
                        {selectedPlan === 'yearly' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 block">Premium Yearly</span>
                        <span className="text-[11px] text-slate-400 font-medium">₹416 / month (billed yearly)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-purple-700">₹4,999 <em className="not-italic text-xs font-normal text-slate-500">/ year</em></span>
                      <span className="text-[10px] text-emerald-600 font-bold block">Save ₹989</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="card p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Payment method</h3>
                <span className="text-[11px] text-slate-400 font-medium block -mt-3">All payments are secure and encrypted.</span>

                {/* Tabs */}
                <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                  {[
                    { id: 'upi', label: 'UPI', icon: Sparkles },
                    { id: 'card', label: 'Card', icon: CreditCard },
                    { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                    { id: 'wallets', label: 'Wallets', icon: Wallet },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setPaymentTab(tab.id as any)}
                        className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                          paymentTab === tab.id
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* UPI App Icons Grid */}
                {paymentTab === 'upi' && (
                  <div className="space-y-4 pt-2">
                    <span className="text-xs font-bold text-slate-800 block">Pay with UPI</span>
                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      {[
                        { id: 'gpay', label: 'GPay', color: 'bg-emerald-100 text-emerald-700' },
                        { id: 'phonepe', label: 'PhonePe', color: 'bg-purple-100 text-purple-700' },
                        { id: 'paytm', label: 'Paytm', color: 'bg-sky-100 text-sky-700' },
                        { id: 'bhim', label: 'BHIM', color: 'bg-amber-100 text-amber-700' },
                        { id: 'other', label: 'Other UPI', color: 'bg-slate-100 text-slate-700' },
                      ].map((app) => (
                        <div
                          key={app.id}
                          onClick={() => setSelectedUpiApp(app.id)}
                          className={`p-2.5 rounded-2xl border cursor-pointer font-extrabold flex flex-col items-center justify-center gap-1 transition-all ${
                            selectedUpiApp === app.id
                              ? 'border-purple-600 bg-purple-50 shadow-xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl ${app.color} flex items-center justify-center text-[10px]`}>
                            {app.label.slice(0, 3)}
                          </div>
                          <span className="text-[10px] text-slate-800">{app.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* UPI ID Input */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-700">UPI ID</span>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="you@upi" 
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-medium"
                        />
                        <button 
                          onClick={() => setIsVerified(true)}
                          className="btn-secondary text-xs font-bold px-4 py-2 rounded-xl"
                        >
                          {isVerified ? '✓ Verified' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Summary & Pay Button */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Premium {selectedPlan}</span>
                    <span className="text-slate-900 font-bold">₹{currentPrice}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Platform Fee</span>
                    <span className="text-emerald-600 font-bold">₹0</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total</span>
                    <span className="text-purple-700 text-lg">₹{currentPrice}</span>
                  </div>

                  <button 
                    onClick={handlePay}
                    className="w-full btn-primary py-3 text-sm font-extrabold rounded-2xl justify-center shadow-lg shadow-purple-600/30"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{currentPrice} Securely</span>
                  </button>

                  <span className="text-[10px] text-center text-slate-400 font-medium block">
                    By proceeding, you agree to Creavora's Terms of Service and Privacy Policy.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
