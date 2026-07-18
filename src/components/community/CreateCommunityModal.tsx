import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCreateCommunityMutation } from '../../redux/features/community/communityApi';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { name: 'Anime & Cosplay', icon: '🍣' },
  { name: 'Art', icon: '🎨' },
  { name: 'Business & Finance', icon: '💵' },
  { name: 'Collectibles & Other Hobbies', icon: '🧩' },
  { name: 'Education & Career', icon: '👩‍🎓' },
  { name: 'Fashion & Beauty', icon: '👗' },
  { name: 'Food & Drinks', icon: '🍔' },
  { name: 'Games', icon: '🕹️' },
  { name: 'Health', icon: '❤️' },
  { name: 'Home & Garden', icon: '🏡' },
  { name: 'Humanities & Law', icon: '📜' },
  { name: 'Identity & Relationships', icon: '🤝' },
  { name: 'Internet Culture', icon: '🐵' },
  { name: 'Movies & TV', icon: '🎬' },
  { name: 'Music', icon: '🎵' },
  { name: 'Nature & Outdoors', icon: '🌿' },
  { name: 'News & Politics', icon: '📰' },
  { name: 'Places & Travel', icon: '✈️' },
  { name: 'Pop Culture', icon: '✨' },
  { name: 'Q&As & Stories', icon: '✏️' },
  { name: 'Reading & Writing', icon: '📖' },
  { name: 'Sciences', icon: '🧪' },
  { name: 'Spooky', icon: '👻' },
  { name: 'Sports', icon: '🏅' },
  { name: 'Technology', icon: '🛰️' },
  { name: 'Vehicles', icon: '🚗' },
  { name: 'Wellness', icon: '🧘' },
  { name: 'Adult Content', icon: '🟥' },
  { name: 'Mature Topics', icon: '🔞' }
];

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [createCommunity, { isLoading }] = useCreateCommunityMutation();

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && selectedCategory) setStep(2);
  };

  const handleSubmit = async () => {
    if (name.length < 3 || name.length > 21) {
      toast.error('Name must be between 3 and 21 characters');
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(name)) {
      toast.error('Name can only contain letters and numbers, with no spaces');
      return;
    }
    if (description.length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    try {
      await createCommunity({
        name,
        description,
        category: selectedCategory,
      }).unwrap();
      
      toast.success('Community created successfully!');
      // Reset and close
      setStep(1);
      setSelectedCategory(null);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to create community');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-[650px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start px-6 pt-6 pb-2">
          <div>
            <h2 className="text-[22px] font-bold text-gray-900 leading-tight">
              {step === 1 ? 'What will your community be about?' : 'Tell us about your community'}
            </h2>
            <p className="text-gray-500 mt-1.5 text-[14px]">
              {step === 1 
                ? 'Choose a topic to help redditors discover your community' 
                : 'A name and description help people understand what your community is all about.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex items-center justify-center -mr-2">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {step === 1 ? (
            <div className="flex flex-wrap gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-bold text-[13px] transition-all
                    ${selectedCategory === cat.name 
                      ? 'border-gray-900 bg-gray-100 text-gray-900' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="text-[14px]">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-8">
              {/* Form Side */}
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Community name *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={21}
                      className="w-full bg-gray-50 text-gray-900 border-none rounded-xl px-5 py-4 text-[16px] font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="text-right text-gray-500 text-[13px] mt-1 pr-2">
                    {name.length}/21
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <textarea 
                      placeholder="Description *"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={500}
                      className="w-full bg-gray-50 text-gray-900 border-none rounded-xl px-5 py-4 text-[16px] min-h-[160px] resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="text-right text-gray-500 text-[13px] mt-1 pr-2">
                    {description.length}/500
                  </div>
                </div>
              </div>

              {/* Preview Side */}
              <div className="w-[300px]">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="h-[80px] bg-gray-100"></div>
                  <div className="p-4 -mt-6">
                    <div className="flex items-end gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white">
                        j/
                      </div>
                    </div>
                    <h3 className="font-bold text-[18px] break-all leading-tight">
                      j/{name || 'communityname'}
                    </h3>
                    <p className="text-[13px] text-gray-500 mt-1">1 weekly visitor • 1 weekly contributor</p>
                    <p className="text-[14px] text-gray-800 mt-3 break-words whitespace-pre-wrap">
                      {description || 'Your community description'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-white rounded-b-xl">
          <div className="flex gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${step === 1 ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
            <div className={`w-1.5 h-1.5 rounded-full ${step === 2 ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
          </div>
          
          <div className="flex gap-3">
            {step === 1 ? (
              <>
                <button 
                  onClick={onClose} 
                  className="px-5 py-2.5 rounded-full font-bold text-[14px] bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleNext}
                  disabled={!selectedCategory}
                  className={`px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors
                    ${selectedCategory ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  Next
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setStep(1)} 
                  className="px-5 py-2.5 rounded-full font-bold text-[14px] bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isLoading || name.length < 3 || description.length < 10}
                  className={`px-5 py-2.5 rounded-full font-bold text-[14px] transition-colors
                    ${!isLoading && name.length >= 3 && description.length >= 10 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {isLoading ? 'Creating...' : 'Create Community'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
