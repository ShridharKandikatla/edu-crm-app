import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../services/api';
import { HiOutlinePaperAirplane, HiOutlinePaperClip, HiOutlineDownload } from 'react-icons/hi';
import { useToast } from '../../context/ToastContext';
import { renderTemplate } from '../../utils/renderTemplate';
import { APP_UNIVERSITY_NAME } from '../../constants/app';
import { config } from '../../config/env';

const API_ROOT = config.apiUrl.replace(/\/api\/?$/, '');

export default function WhatsAppTab({ leadId, lead }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [configured, setConfigured] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const scrollRef = useRef(null);
  const suppressScrollRef = useRef(false);

  const fetchThread = useCallback(async (targetPage = 1, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const res = await api.whatsapp.getThread(leadId, { page: targetPage, limit: 50 });
      if (res && res.success && res.data) {
        setMessages((prev) => append ? [...(res.data.messages || []), ...prev] : (res.data.messages || []));
        setHasMore(Boolean(res.data.pagination?.hasMore));
        setPage(targetPage);
        setConfigured(Boolean(res.data.configured));
        setWhatsappNumber(res.data.whatsappNumber || '');
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [leadId]);

  useEffect(() => { fetchThread(); }, [fetchThread]);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    const el = scrollRef.current;
    const prevHeight = el ? el.scrollHeight : 0;
    suppressScrollRef.current = true;
    try {
      await fetchThread(page + 1, true);
    } finally {
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - prevHeight;
      });
      suppressScrollRef.current = false;
    }
  };

  useEffect(() => {
    api.templates.getAll({ limit: 50 }).then((res) => {
      if (res && res.success && res.data) {
        setTemplates((res.data || []).filter((t) => t.isActive));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (suppressScrollRef.current) { suppressScrollRef.current = false; return; }
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

      {hasMore && !loading && (
        <div className="mb-2 text-center">
          <button className="btn btn-outline btn-sm" onClick={handleLoadMore} disabled={loadingMore} aria-label="Load older messages">
            {loadingMore ? 'Loading...' : 'Load older messages'}
          </button>
        </div>
      )}

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
                    : 'rounded-bl-sm bg-white dark:bg-[#1f2530] text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <div className={`mt-1 text-right text-[0.625rem] ${m.direction === 'OUT' ? 'text-indigo-200 dark:text-indigo-400' : 'text-gray-400'}`}>
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
        {configured && templates.length > 0 && (
          <div className="mb-2 flex items-center gap-2">
            <label htmlFor="wa-template" className="text-sm font-semibold text-gray-700">Use template</label>
            <select
              id="wa-template"
              className="form-select"
              defaultValue=""
              onChange={(e) => {
                const t = templates.find((x) => x.id === e.target.value);
                if (!t) {
                  setSelectedTemplate(null);
                  return;
                }
                setSelectedTemplate(t);
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
        {selectedTemplate && selectedTemplate.attachments && selectedTemplate.attachments.length > 0 && (
          <div className="mb-2 rounded-xl border border-gray-200 bg-white dark:bg-[#1f2530] p-3">
            <p className="mb-2 text-sm font-semibold text-gray-700">Template files</p>
            <div className="flex flex-col gap-1.5">
              {selectedTemplate.attachments.map((a) => (
                <a
                  key={a.id}
                  href={`${API_ROOT}${a.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  title={`Download ${a.originalName}`}
                >
                  <HiOutlinePaperClip className="h-4 w-4 shrink-0 text-indigo-500" />
                  <span className="min-w-0 flex-1 truncate">{a.originalName}</span>
                  <HiOutlineDownload className="h-4 w-4 shrink-0 text-gray-400" />
                </a>
              ))}
            </div>
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
