import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, ShoppingBag, Bot, Sparkles } from 'lucide-react';
import UploadZone from '@/components/ocr/UploadZone';
import ExtractedItemsTable from '@/components/ocr/ExtractedItemsTable';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { ocrService } from '@/services/ocrService';
import { success as showSuccess, error as showError } from '@/components/ui/Toast';

const suggestions = [
  'Do you also need milk?',
  'Add some biscuits?',
  'How about tea?',
  'Need cooking oil?',
];

// Generate a stable fake product ID from item name
function fakeProductId(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return `ocr-${Math.abs(hash)}`;
}

// Estimate a realistic price range for common Indian grocery items
function estimatePrice(name) {
  const lower = name.toLowerCase();
  const priceMap = {
    milk: 60, bread: 45, butter: 55, egg: 90, paneer: 80,
    rice: 120, atta: 65, dal: 110, oil: 150, sugar: 45,
    salt: 20, tea: 95, coffee: 180, biscuit: 40, maggi: 35,
    potato: 40, onion: 50, tomato: 60, banana: 60, apple: 150,
  };
  for (const [key, price] of Object.entries(priceMap)) {
    if (lower.includes(key)) return price;
  }
  return Math.floor(Math.random() * 80) + 30; // fallback: 30–110 range
}

export default function OcrPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedItems, setExtractedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleImageUpload = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setExtractedItems([]);
  };

  const handleExtract = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', image);
      const response = await ocrService.extractItems(formData);
      setExtractedItems(response.data.items || []);
      showSuccess('Items extracted successfully!');
    } catch (err) {
      showError(err.message || 'Failed to extract items');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...extractedItems];
    updated[index] = { ...updated[index], [field]: value };
    setExtractedItems(updated);
  };

  const handleDeleteItem = (index) => {
    setExtractedItems(extractedItems.filter((_, i) => i !== index));
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (extractedItems.length === 0) {
      showError('No items to add.');
      return;
    }

    // Add each extracted item directly into the frontend cart store
    // Uses a virtual "OCR Store" shopId so items can be grouped
    const OCR_SHOP_ID = 'ocr-store';
    let addedCount = 0;

    for (const item of extractedItems) {
      const name = (item.name || 'Unknown Item').trim();
      const quantity = Number(item.quantity) || 1;
      const price = estimatePrice(name);

      const product = {
        id: fakeProductId(name),
        name: name,
        price: price,
        discountedPrice: Math.max(price - 10, price * 0.9),
        unit: item.unit || 'pack',
        shopId: OCR_SHOP_ID,
        imageUrl: null,
      };

      addItem(product, quantity);
      addedCount++;
    }

    showSuccess(`✅ Added ${addedCount} items to your cart!`);
    navigate('/cart');
  };

  return (
    <div className="container py-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary p-0.5 mx-auto mb-4">
            <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">OCR Grocery Scanner</h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Take a photo of your kirana list or receipt and we'll automatically extract the items
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <UploadZone onUpload={handleImageUpload} preview={preview} />
            {preview && !extractedItems.length && (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                onClick={handleExtract}
              >
                <Bot className="h-5 w-5 mr-2" /> Extract Items
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {extractedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Extracted Items ({extractedItems.length})</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(!editing)}
                  >
                    {editing ? 'Done' : 'Edit'}
                  </Button>
                </div>

                <ExtractedItemsTable
                  items={extractedItems}
                  editing={editing}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                />

                <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-2">AI Suggestions</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" /> Add All to Cart
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
