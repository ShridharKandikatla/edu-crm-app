import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../services/api';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import { useToast } from '../../context/ToastContext';

export default function WhatsAppTab({ leadId }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [configured, setConfigured] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const fetchThread = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.whatsapp.getThread(leadId);
      if (res && res.success && res.data) {
        setMessages(res.data.messages || []);
        setConfigured(Boolean(res.data.configured));
        setWhatsappNumber(res.data.whatsappNumber || '');
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => { fetchThread(); }, [fetchThread]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    try {
      setSending(true);
      await api.whatsapp.sendMessage(leadId, { body });
      setText('');
      fetchThread();
    } catch (error) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="py-10 text-center text-gray-500">Loading WhatsApp thread...</div>;
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
        <span>{whatsappNumber ? `WhatsApp: ${whatsappNumber}` : 'No WhatsApp number linked'}</span>
        {!configured && (
          <span className="badge badge-neutral">Integration not configured</span>
        )}
      </div>

      <div ref={scrollRef} className="max-h-[420px] space-y-3 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4">
        {messages.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No WhatsApp messages yet. Send the first message below.</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.direction === 'OUT' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  m.direction === 'OUT'
                    ? 'rounded-br-sm bg-indigo-600 text-white'
                    : 'rounded-bl-sm bg-white text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <div className={`mt-1 text-right text-[0.625rem] ${m.direction === 'OUT' ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {formatTime(m.createdAt)}
                  {m.status && m.direction === 'OUT' ? ` · ${m.status}` : ''}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {configured && (
        <form onSubmit={handleSend} className="mt-4 flex items-center gap-2">
          <input
            className="form-input flex-1"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            maxLength={4000}
          />
          <button className="btn btn-primary" type="submit" disabled={sending || !text.trim()} aria-label="Send message">
            <HiOutlinePaperAirplane /> {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      )}
    </div>
  );
}
