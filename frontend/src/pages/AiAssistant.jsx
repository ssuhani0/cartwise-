import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles, TrendingUp, DollarSign, BookOpen, Calendar } from 'lucide-react';
import Chatbot from '@/components/ai/Chatbot';
import VoiceInput from '@/components/ai/VoiceInput';
import SuggestionChips from '@/components/ai/SuggestionChips';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { recommendationService } from '@/services/recommendationService';
import { success, error } from '@/components/ui/Toast';

const quickActions = [
  { icon: TrendingUp, label: 'Budget Optimizer', action: 'budget' },
  { icon: Sparkles, label: 'Combo Deals', action: 'combos' },
  { icon: DollarSign, label: 'Best Offers', action: 'offers' },
  { icon: BookOpen, label: 'Recipe Search', action: 'recipe' },
  { icon: Calendar, label: 'Monthly Prediction', action: 'prediction' },
];

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! 👋 I\'m your CartWise AI assistant. I can help you with:\n\n• Finding best deals & combos\n• Budget optimization\n• Recipe suggestions\n• Monthly grocery prediction\n• Answering questions about products\n\nHow can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text) => {
    if (!text?.trim()) return;
    const userMessage = text.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      let response;
      if (userMessage.toLowerCase().includes('budget')) {
        const res = await recommendationService.getBudgetOptimization({ budget: 5000 });
        response = res.data;
      } else if (userMessage.toLowerCase().includes('recipe')) {
        const res = await recommendationService.getRecipe(userMessage.replace('recipe', '').trim());
        response = res.data;
      } else if (userMessage.toLowerCase().includes('prediction') || userMessage.toLowerCase().includes('monthly')) {
        const res = await recommendationService.getMonthlyPrediction();
        response = res.data;
      } else {
        const res = await recommendationService.getRecommendations({ query: userMessage });
        response = res.data;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: formatResponse(response),
          data: response,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (data) => {
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    if (data?.error) return `Oops! I encountered an error: ${data.error}`;
    
    // Handle Recipe object
    if (data?.recipeName) {
      if (!data.ingredients || data.ingredients.length === 0) {
        return `I couldn't find specific ingredients for "${data.recipeName}". Please try another recipe.`;
      }
      const header = `🍲 **${data.recipeName}**\nEstimated Cost: ₹${data.estimatedCost || 'Unknown'}\n\n**Ingredients:**\n`;
      const items = data.ingredients.map(ing => `• ${ing.name}: ${ing.quantity} ${ing.unit || ''}`).join('\n');
      return header + items;
    }

    // Handle Budget object
    if (data?.alternatives) {
      if (data.alternatives.error) {
        return `Error optimizing budget: ${data.alternatives.error}`;
      }
      if (Array.isArray(data.alternatives) && data.alternatives.length > 0) {
        const header = `💰 **Budget Optimizer (₹${data.budget})**\nHere are some better value alternatives:\n\n`;
        const items = data.alternatives.map(alt => `• **${alt.name}** (₹${alt.price})\n  Savings: ₹${alt.savings || 0}\n  Why: ${alt.reason || 'Better value'}`).join('\n\n');
        return header + items;
      }
      return "Your current cart is already highly optimized for your budget!";
    }

    // Handle Monthly Prediction object
    if (data?.prediction) {
      if (data.prediction.error) {
         return `Error predicting groceries: ${data.prediction.error}`;
      }
      const pred = data.prediction;
      const header = `📅 **Monthly Grocery Prediction**\nBased on your purchase history.\nEstimated Monthly Budget: ₹${pred.estimatedBudget || pred.estimated_budget || 0}\n\n**Predicted Needs:**\n`;
      const predictedItems = pred.predictedItems || pred.predicted_items || [];
      if (predictedItems.length === 0) return "Not enough purchase history to make a prediction yet!";
      const items = predictedItems.map(item => `• ${item.name} (${item.estimatedQuantity || item.estimated_quantity} ${item.unit || ''})`).join('\n');
      return header + items;
    }
    
    // Handle general recommendations object
    if (data?.recommendations) {
      if (data.recommendations.length === 0) {
        return "I couldn't find any specific recommendations for that right now. Could you tell me more about what you're looking for?";
      }
      if (data.recommendations.error) {
         return `Error getting recommendations: ${data.recommendations.error}`;
      }
      return data.recommendations.map((item) => {
        const name = item.product_name || item.name || '';
        const price = item.price ? ` - ₹${item.price}` : '';
        const reason = item.reason ? `\n  ↳ ${item.reason}` : '';
        return `• ${name}${price}${reason}`;
      }).join('\n\n');
    }

    if (Array.isArray(data)) {
      return data.map((item) => `• ${item.name || item}: ${item.price ? `₹${item.price}` : ''}`).join('\n');
    }
    return JSON.stringify(data, null, 2);
  };

  const handleSuggestion = (suggestion) => {
    handleSend(suggestion);
  };

  const handleVoiceResult = (transcript) => {
    setInput(transcript);
    handleSend(transcript);
  };

  return (
    <div className="container py-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary p-0.5">
              <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Assistant</h1>
              <p className="text-sm text-muted-foreground">Powered by smart recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={language === 'en' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setLanguage('en')}
            >
              English
            </Button>
            <Button
              variant={language === 'hi' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setLanguage('hi')}
            >
              हिन्दी
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Chatbot
              messages={messages}
              loading={loading}
              onSend={handleSend}
              input={input}
              onInputChange={setInput}
              messagesEndRef={messagesEndRef}
              language={language}
            />
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleSuggestion(action.label)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <action.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <SuggestionChips onSelect={handleSuggestion} language={language} />

            <div className="flex justify-center">
              <VoiceInput onResult={handleVoiceResult} language={language} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
