import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../context/LanguageContext';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  collapsed?: boolean;
}

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ collapsed = false }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl transition-all duration-200 cursor-pointer border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] ${
          collapsed ? 'p-2 justify-center w-10 h-10' : 'px-3 py-2 w-full justify-between text-sm'
        }`}
        title={collapsed ? currentLang.label : undefined}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0" role="img" aria-label={currentLang.label}>
            {currentLang.flag}
          </span>
          {!collapsed && (
            <span className="truncate font-medium text-[var(--text-primary)]">
              {currentLang.label}
            </span>
          )}
        </div>
        {!collapsed && (
          <ChevronDown
            size={14}
            className={`text-[var(--text-faint)] transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute z-100 mt-2 w-40 animate-scaleIn origin-top ${
            collapsed ? 'left-1/2 -translate-x-1/2 bottom-full mb-2' : 'left-0'
          }`}
          style={{
            background: 'var(--bg-elevated)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--border-default)',
            borderRadius: 16,
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}
        >
          <div className="py-1.5">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-left ${
                  lang.code === language
                    ? 'text-[var(--text-primary)] bg-[var(--bg-surface-hover)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                }`}
              >
                <span className="text-base" role="img" aria-label={lang.label}>
                  {lang.flag}
                </span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
