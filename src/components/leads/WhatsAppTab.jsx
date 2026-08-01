import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../services/api';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import { useToast } from '../../context/ToastContext';
import { renderTemplate } from '../../utils/renderTemplate';
import { APP_UNIVERSITY_NAME } from '../../constants/app';

export default function WhatsAppTab({ leadId, lead }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [configured, setConfigured] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
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
    api.templates.getAll().then((res) => {
      if (res && res.success && res.data) {
        setTemplates((res.data.templates || []).filter((t) => t.isActive));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    if (!configured) {
      toast.error('WhatsApp integration is not configured');
      return;
    }
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

      <div className="mt-4">
        {!configured && (
          <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[0.8125rem] text-amber-800">
            WhatsApp integration is not configured.
          </div>
        )}
        {templates.length > 0 && (
          <div className="mb-2 flex items-center gap-2">
            <label htmlFor="wa-template" className="text-sm font-semibold text-gray-700">Use template</label>
            <select
              id="wa-template"
              className="form-select"
              defaultValue=""
              onChange={(e) => {
                const t = templates.find((x) => x.id === e.target.value);
                if (!t) return;
                const vars = {
                  name: lead?.name || '',
                  phone: lead?.phone || '',
                  course: lead?.course?.name || '',
                  intake: lead?.intake?.name || '',
                  university: APP_UNIVERSITY_NAME,
                };
                setText(renderTemplate(t.body, vars));
              }}
            >
              <option value="">Select a template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <textarea
            className="form-input flex-1 resize-y"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            maxLength={4000}
          />
          <button className="btn btn-primary" type="submit" disabled={sending || !text.trim() || !configured} aria-label="Send message">
            <HiOutlinePaperAirplane /> {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
