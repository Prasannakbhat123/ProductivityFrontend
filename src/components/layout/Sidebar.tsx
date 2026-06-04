import { useState } from 'react';
import { Menu, X, Moon, Sun, Wallet } from 'lucide-react';
import { tabs, type TabKey } from '../../types/ui';

type SidebarProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  isDark: boolean;
  onToggleTheme: () => void;
};

export function Sidebar({ activeTab, onTabChange, isDark, onToggleTheme }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTabChange = (tab: TabKey) => {
    onTabChange(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-5 z-40 flex items-center justify-center rounded-xl border bg-lime-300 p-2 lg:hidden"
      >
        <Menu size={20} className="text-zinc-950" />
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity duration-300 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col transform px-4 py-5 transition-transform duration-300 ease-in-out lg:relative lg:h-auto lg:w-auto lg:transform-none lg:transition-none lg:sticky lg:top-0 lg:overflow-y-auto lg:border-r ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isDark
            ? 'border-r border-zinc-800 bg-zinc-950 text-zinc-100'
            : 'border-r border-zinc-300 bg-white text-zinc-900'
        }`}
      >
        <div className="mb-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-base font-bold tracking-tight sm:text-lg">
            <Wallet size={20} className="text-lime-300" />
            <span>LedgerFlow</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center rounded-xl border p-1.5 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            onToggleTheme();
            setIsOpen(false);
          }}
          className={`mb-4 flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
            isDark
              ? 'border-zinc-700 bg-zinc-900 hover:border-lime-400'
              : 'border-zinc-300 bg-zinc-100 hover:border-lime-500'
          }`}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? 'Light' : 'Dark'}
        </button>

        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                className={`flex items-center cursor-pointer gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-lime-300 text-zinc-950'
                    : isDark
                      ? 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
                }`}
                type="button"
                onClick={() => handleTabChange(tab.key)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
