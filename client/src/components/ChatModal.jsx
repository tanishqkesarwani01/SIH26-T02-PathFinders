import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Truck, ShieldCheck, User, MessageSquare } from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { useAuth } from '../context/AuthContext';

export default function ChatModal({ isOpen, onClose, booking }) {
  const { messages, sendChatMessage } = useLogistics();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const bookingMessages = messages.filter(m => m.bookingId === booking?.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, bookingMessages]);

  if (!isOpen || !booking) return null;

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(booking.id, inputText.trim());
    setInputText('');
  };

  const QUICK_REPLIES = [
    'I have arrived at the pickup location.',
    'Is the cargo packed and ready for loading?',
    'Please keep the pickup OTP ready.',
    'Approaching the destination highway exit.',
    'Running on schedule, ETA accurate.'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-750 rounded-2xl max-w-lg w-full h-[600px] shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-slate-850 border-b border-slate-750 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="text-sm font-bold text-white">
                  {user?.role === 'DRIVER' ? booking.shipperName : booking.driverName}
                </h3>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400">
                Shipment #{booking.id} • {booking.pickupCity} ➔ {booking.dropoffCity}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3 bg-slate-950/60">
          {bookingMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Send a message to coordinate pickup or delivery.</p>
            </div>
          ) : (
            bookingMessages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              const isSystem = msg.senderId === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center my-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] text-emerald-300 font-medium max-w-sm">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                    {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Chips */}
        <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-[10px]">
          <span className="text-slate-500 shrink-0 font-medium">Quick:</span>
          {QUICK_REPLIES.map((reply, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                sendChatMessage(booking.id, reply);
              }}
              className="shrink-0 px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700/80 hover:text-white transition"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="p-3 bg-slate-850 border-t border-slate-750 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message to driver/shipper..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
