import React from 'react';
import { X, Copy, Check, MessageCircle, Send, Share2 } from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url, title = 'Check this out!' }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error('Failed to copy link'));
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5 text-white" />,
      color: 'bg-[#25D366] hover:bg-[#128C7E]',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`
    },
    {
      name: 'Messenger',
      icon: <MessageCircle className="w-5 h-5 text-white" />,
      color: 'bg-[#0084FF] hover:bg-[#006AFF]',
      href: `fb-messenger://share/?link=${encodeURIComponent(url)}`
    },
    {
      name: 'Telegram',
      icon: <Send className="w-5 h-5 text-white" />,
      color: 'bg-[#0088cc] hover:bg-[#0077b5]',
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'Instagram',
      icon: <InstagramIcon className="w-5 h-5 text-white" />,
      color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90',
      href: `instagram://camera`
    },
    {
      name: 'Other',
      icon: <Share2 className="w-5 h-5 text-white" />,
      color: 'bg-gray-800 hover:bg-gray-700',
      action: () => {
        if (navigator.share) {
          navigator.share({
            title: title,
            url: url,
          }).catch(() => {});
        } else {
          handleCopy();
        }
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-[16px]">Share</h3>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {shareOptions.map((option) => (
              <div key={option.name} className="flex flex-col items-center gap-2">
                {option.action ? (
                  <button 
                    onClick={option.action}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${option.color}`}
                  >
                    {option.icon}
                  </button>
                ) : (
                  <a
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${option.color}`}
                  >
                    {option.icon}
                  </a>
                )}
                <span className="text-[11px] font-medium text-gray-600">{option.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex-1 px-2 text-[13px] text-gray-500 truncate select-all">
              {url}
            </div>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-100'}`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
