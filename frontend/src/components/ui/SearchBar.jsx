import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

export default function SearchBar({ onSearch, placeholder = 'Search products, shops...', className }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch?.('');
  }, [onSearch]);

  return (
    <div
      className={cn(
        'relative flex items-center transition-all duration-300',
        focused && 'scale-[1.02]',
        className,
      )}
    >
      <Search className={cn(
        'absolute left-3 h-4 w-4 transition-colors duration-200',
        focused ? 'text-primary' : 'text-muted-foreground',
      )} />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={cn(
          'flex h-10 w-full rounded-xl border bg-background pl-10 pr-10 py-2 text-sm',
          'placeholder:text-muted-foreground/60',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'transition-all duration-200',
          focused && 'ring-2 ring-primary/20 border-primary',
        )}
      />
      <AnimatePresence>
        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleClear}
            className="absolute right-3 rounded-lg p-0.5 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
