import { Sparkles, TrendingUp, DollarSign, BookOpen, Calendar } from 'lucide-react';
import Card from '@/components/ui/Card';

const suggestions = {
  en: [
    { icon: TrendingUp, label: 'Budget Optimizer', query: 'Help me optimize my grocery budget' },
    { icon: Sparkles, label: 'Today\'s Deals', query: 'Show me today\'s best deals' },
    { icon: DollarSign, label: 'Best Offers', query: 'What are the best offers right now?' },
    { icon: BookOpen, label: 'Recipe Ideas', query: 'Suggest some recipes with vegetables' },
    { icon: Calendar, label: 'Monthly Plan', query: 'Predict my monthly grocery needs' },
  ],
  hi: [
    { icon: TrendingUp, label: 'बजट ऑप्टिमाइज़र', query: 'मेरे किराना बजट को अनुकूलित करें' },
    { icon: Sparkles, label: 'आज के ऑफ़र', query: 'आज के सबसे अच्छे ऑफ़र दिखाएं' },
    { icon: DollarSign, label: 'सर्वश्रेष्ठ ऑफ़र', query: 'अभी सबसे अच्छे ऑफ़र क्या हैं?' },
    { icon: BookOpen, label: 'रेसिपी आइडियाज', query: 'सब्जियों के साथ कुछ रेसिपी सुझाएं' },
    { icon: Calendar, label: 'मासिक योजना', query: 'मेरी मासिक किराना ज़रूरतों का अनुमान लगाएं' },
  ],
};

export default function SuggestionChips({ onSelect, language = 'en' }) {
  const items = suggestions[language] || suggestions.en;

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-sm mb-3">Suggestions</h3>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => onSelect(item.query)}
            className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-muted transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
