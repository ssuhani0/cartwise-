import { motion } from 'framer-motion';
import { Edit3, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export default function ExtractedItemsTable({ items, editing, onUpdate, onDelete }) {
  if (!items?.length) return null;

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-xl border bg-card"
        >
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
            item.confidence > 0.8 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30',
          )}>
            {item.confidence > 0.8 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                type="text"
                value={item.name}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                className="w-full text-sm font-medium bg-transparent border-b border-dashed border-muted-foreground/30 focus:outline-none focus:border-primary"
              />
            ) : (
              <p className="text-sm font-medium">{item.name}</p>
            )}

            <div className="flex items-center gap-2 mt-1">
              {editing ? (
                <input
                  type="number"
                  value={item.quantity || 1}
                  min={1}
                  onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-16 text-xs bg-transparent border rounded px-1 py-0.5 text-center focus:outline-none focus:border-primary"
                />
              ) : (
                <span className="text-xs text-muted-foreground">Qty: {item.quantity || 1}</span>
              )}
              <Badge variant={item.confidence > 0.8 ? 'success' : 'warning'} className="text-[10px]">
                {Math.round((item.confidence || 0.5) * 100)}%
              </Badge>
            </div>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => onUpdate(index, 'editing', !item.editing)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={() => onDelete(index)}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
