import { useState } from "react";
import { Settings as SettingsIcon, User, Bell, CreditCard, Shield, HelpCircle, Save } from "lucide-react";
import { Card } from "../ui/Bits.jsx";
import { Avatar } from "../ui/Media.jsx";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  const [name, setName] = useState("Arjun Singh");
  const [email, setEmail] = useState("arjun.singh@gmail.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-6 min-h-[calc(100vh-72px)] bg-canvas">
      <div>
        <h1 className="text-[25px] font-extrabold tracking-tight flex items-center gap-2">
          <SettingsIcon className="text-brand-600" size={24} /> Settings
        </h1>
        <p className="text-[14px] text-muted">Configure your personal preferences and account settings</p>
      </div>

      <div className="mt-6 flex flex-col md:flex-row gap-6">
        {/* tabs list vertical sidebar */}
        <aside className="w-full md:w-[240px] shrink-0">
          <Card className="p-2 space-y-1">
            {[
              { id: "account", label: "Account Profile", icon: User },
              { id: "notifs", label: "Notifications", icon: Bell },
              { id: "billing", label: "Billing & Wallet", icon: CreditCard },
              { id: "privacy", label: "Security & Privacy", icon: Shield },
              { id: "help", label: "Help & Support", icon: HelpCircle },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-[13.5px] font-semibold transition ${
                    activeTab === t.id ? "bg-brand-50 text-brand-700 font-bold" : "text-ink/80 hover:bg-canvas"
                  }`}
                >
                  <Icon size={16} className={activeTab === t.id ? "text-brand-600" : "text-ink/60"} />
                  {t.label}
                </button>
              );
            })}
          </Card>
        </aside>

        {/* tab contents pane */}
        <div className="flex-1">
          <Card className="p-6 bg-white border border-line">
            {activeTab === "account" && (
              <form onSubmit={handleSave} className="space-y-5">
                <h3 className="text-[16px] font-extrabold text-ink border-b border-line pb-3">Profile Information</h3>
                
                <div className="flex items-center gap-4">
                  <Avatar name={name} size={64} ring="ring-brand-100" />
                  <div>
                    <button type="button" className="h-8 rounded-lg border border-line px-3.5 text-[12px] font-bold text-ink hover:bg-canvas">
                      Change Avatar
                    </button>
                    <p className="mt-1 text-[11px] text-muted">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[12.5px] font-bold text-muted mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-3.5 text-[13.5px] border border-line rounded-xl bg-canvas focus:outline-none focus:border-brand-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-bold text-muted mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-3.5 text-[13.5px] border border-line rounded-xl bg-canvas focus:outline-none focus:border-brand-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-bold text-muted mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 px-3.5 text-[13.5px] border border-line rounded-xl bg-canvas focus:outline-none focus:border-brand-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12.5px] font-bold text-muted mb-1.5">Country</label>
                    <input
                      type="text"
                      disabled
                      value="India (Centric)"
                      className="w-full h-11 px-3.5 text-[13.5px] border border-line rounded-xl bg-canvas/50 text-muted cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-line flex justify-end">
                  <button
                    type="submit"
                    className="flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-5 text-[13px] font-bold text-white hover:bg-brand-700 shadow"
                  >
                    <Save size={15} /> Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === "notifs" && (
              <form onSubmit={handleSave} className="space-y-5">
                <h3 className="text-[16px] font-extrabold text-ink border-b border-line pb-3">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <label className="flex items-start gap-3.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifEmail}
                      onChange={(e) => setNotifEmail(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500"
                    />
                    <div className="leading-tight">
                      <p className="text-[13.5px] font-bold text-ink">Email Notifications</p>
                      <p className="text-[12px] text-muted mt-0.5">Receive newsletter, receipt invoices and creator updates on email</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifPush}
                      onChange={(e) => setNotifPush(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500"
                    />
                    <div className="leading-tight">
                      <p className="text-[13.5px] font-bold text-ink">Push Notifications</p>
                      <p className="text-[12px] text-muted mt-0.5">Receive instant popups when a creator goes live or replies to a chat</p>
                    </div>
                  </label>
                </div>

                <div className="pt-3 border-t border-line flex justify-end">
                  <button
                    type="submit"
                    className="flex h-10 items-center gap-1.5 rounded-xl bg-brand-600 px-5 text-[13px] font-bold text-white hover:bg-brand-700 shadow"
                  >
                    <Save size={15} /> Save Preferences
                  </button>
                </div>
              </form>
            )}

            {activeTab === "billing" && (
              <div className="space-y-5">
                <h3 className="text-[16px] font-extrabold text-ink border-b border-line pb-3">Billing & Payments</h3>
                <div className="p-4 bg-canvas rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 font-black">
                      ₹
                    </span>
                    <div className="leading-tight">
                      <p className="text-[13.5px] font-bold">Standard UPI Wallet</p>
                      <p className="text-[12px] text-muted">Primary Deposit Method</p>
                    </div>
                  </div>
                  <span className="text-[14.5px] font-black text-ink">Active</span>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-5">
                <h3 className="text-[16px] font-extrabold text-ink border-b border-line pb-3">Security & Privacy</h3>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-[13.5px] py-1">
                    <div className="leading-tight">
                      <p className="font-bold text-ink">Two-Factor Authentication</p>
                      <p className="text-[11.5px] text-muted mt-0.5">Add an extra layer of security to your wallet</p>
                    </div>
                    <button className="h-8 rounded-lg border border-line px-3 text-[11.5px] font-bold text-ink">Enable</button>
                  </div>
                  <div className="flex items-center justify-between text-[13.5px] py-1">
                    <div className="leading-tight">
                      <p className="font-bold text-ink">Profile Visibility</p>
                      <p className="text-[11.5px] text-muted mt-0.5">Allow other fans to see your level badges in leaderboards</p>
                    </div>
                    <button className="h-8 rounded-lg border border-brand-200 px-3 text-[11.5px] font-bold text-brand-600 bg-brand-50">Public</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "help" && (
              <div className="space-y-5">
                <h3 className="text-[16px] font-extrabold text-ink border-b border-line pb-3">Help & Support</h3>
                <p className="text-[13.5px] text-muted leading-relaxed">
                  Have questions about coin deposits, rewards, or subscription packages? Our support team is here to assist you.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="p-4 hover:border-brand-200 transition cursor-pointer">
                    <p className="text-[13.5px] font-bold">Frequently Asked Questions</p>
                    <p className="text-[11.5px] text-muted mt-1 leading-snug">Read guides on wallet loading, refunds and rewards.</p>
                  </Card>
                  <Card className="p-4 hover:border-brand-200 transition cursor-pointer">
                    <p className="text-[13.5px] font-bold">Contact Support</p>
                    <p className="text-[11.5px] text-muted mt-1 leading-snug">Open a support ticket or talk with our customer care agent.</p>
                  </Card>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
