import { HiOutlineChat } from 'react-icons/hi';

export default function CommentsTab({ comments, newComment, setNewComment, onSubmit, submitting, formatDateTime }) {
  return (
    <div className="animate-fade-in">
      <form onSubmit={onSubmit} className="mb-5">
        <textarea
          className="form-textarea"
          placeholder="Add a comment about this lead..."
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        ></textarea>
        <button type="submit" className="btn btn-primary btn-sm mt-2" disabled={submitting}>
          <HiOutlineChat /> {submitting ? 'Adding...' : 'Add Comment'}
        </button>
      </form>
      {comments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => {
            const authorInitials = comment.user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
            return (
              <div key={comment.id} className="card p-4 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-[0.8125rem]">
                  {authorInitials}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <strong className="text-[0.8125rem] text-gray-800">{comment.user?.name}</strong>
                    <span className="text-[0.7rem] text-gray-400">{formatDateTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-[0.875rem] text-gray-600 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No comments yet</div>
        </div>
      )}
    </div>
  );
}
