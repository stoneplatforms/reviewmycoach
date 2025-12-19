'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy } from '../../lib/supabase-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface MarketplaceCard {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  price: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface UserData {
  role: string;
  displayName: string;
  email: string;
}

export default function AdminCardsManagement() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [cards, setCards] = useState<MarketplaceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<MarketplaceCard | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    price: 0,
    isActive: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await checkAdminAccess(session.user.id);
      } else {
        router.push('/signin');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await checkAdminAccess(session.user.id);
      } else {
        router.push('/signin');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const checkAdminAccess = async (userId: string) => {
    try {
      const userSnap = await doc('users', userId).get();
      
      if (userSnap?.exists()) {
        const userData = userSnap.data() as UserData;
        if (userData.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        setUserRole(userData.role);
        await fetchCards();
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      const q = query('card_marketplace', orderBy('created_at', 'desc'));
      const snapshot = await q.get();
      
      const cardsData: MarketplaceCard[] = [];
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        cardsData.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          imageUrl: data.image_url || data.imageUrl,
          price: data.price,
          isActive: data.is_active !== undefined ? data.is_active : data.isActive,
          createdAt: data.created_at || data.createdAt,
          updatedAt: data.updated_at || data.updatedAt,
        } as MarketplaceCard);
      });
      
      setCards(cardsData);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.imageUrl || formData.price <= 0) {
      alert('Please fill in all required fields (name, image URL, and price > 0)');
      return;
    }

    setSaving(true);
    try {
      const cardData: any = {
        name: formData.name,
        description: formData.description || '',
        image_url: formData.imageUrl,
        price: formData.price,
        is_active: formData.isActive,
        updated_at: new Date().toISOString(),
      };

      if (editingCard) {
        // Update existing card
        await setDoc('card_marketplace', editingCard.id, cardData);
        alert('Card updated successfully!');
      } else {
        // Create new card
        cardData.created_at = new Date().toISOString();
        await setDoc('card_marketplace', '', cardData);
        alert('Card created successfully!');
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        price: 0,
        isActive: true,
      });
      setShowForm(false);
      setEditingCard(null);
      await fetchCards();
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Error saving card. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (card: MarketplaceCard) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      description: card.description || '',
      imageUrl: card.imageUrl,
      price: card.price,
      isActive: card.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc('card_marketplace', cardId);
      alert('Card deleted successfully!');
      await fetchCards();
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Error deleting card. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      price: 0,
      isActive: true,
    });
    setShowForm(false);
    setEditingCard(null);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile Cards Management</h1>
            <p className="text-gray-600">
              Create and manage profile cards for the marketplace
            </p>
          </div>
          <button
            onClick={() => {
              handleCancel();
              setShowForm(!showForm);
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium"
          >
            {showForm ? 'Cancel' : '+ Create New Card'}
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {editingCard ? 'Edit Card' : 'Create New Card'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., Classic Blue, Premium Gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Brief description of the card..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://example.com/card-image.jpg"
              />
              {formData.imageUrl && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div className="relative w-32 aspect-[4/5] border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={formData.imageUrl}
                      alt="Card preview"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-card.png';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="9.99"
                />
              </div>

              <div className="flex items-center pt-8">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active (visible in marketplace)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : editingCard ? 'Update Card' : 'Create Card'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards List */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Marketplace Cards ({cards.length})
          </h2>
        </div>

        {cards.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`border-2 rounded-xl overflow-hidden transition-all ${
                    card.isActive
                      ? 'border-gray-200 hover:border-gray-300'
                      : 'border-gray-100 opacity-60'
                  }`}
                >
                  {/* Card Image - Preview only (no profile picture in admin view) */}
                  <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
                    {card.imageUrl ? (
                      <div className="absolute inset-0">
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    {!card.isActive && (
                      <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
                        Inactive
                      </div>
                    )}
                  </div>

                  {/* Card Info */}
                  <div className="p-4 bg-white">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.name}</h3>
                    {card.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{card.description}</p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-gray-900">${card.price}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        card.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {card.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(card)}
                        className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No cards yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              Create your first profile card to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

