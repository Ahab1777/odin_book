import { useState, useEffect } from 'react';
import type { UserPostCardContent, Like } from '../../types/auth';
import { Link } from 'react-router';
import { useAuth } from '../auth';
import { api } from '../../lib/api';

type InlineComment = {
  id: string;
  content: string;
  postId: string;
  userId: string;
  createdAt: string;
  user?: { id: string; username: string };
};

export default function UserPostCard(post: UserPostCardContent) {
  const { user } = useAuth();

  // Likes
  const [likes, setLikes] = useState<Like[]>(post.likes ?? []);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    setLikes(post.likes ?? []);
  }, [post.likes]);

  useEffect(() => {
    setIsLiked(Boolean(user && likes.some((l) => l.userId === user.id)));
  }, [likes, user]);

  // Comments
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<InlineComment[]>(
    (post.comments as InlineComment[]) ?? []
  );
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    setComments((post.comments as InlineComment[]) ?? []);
  }, [post.comments]);

  async function submitComment() {
    if (!user) return;
    const content = commentInput.trim();
    if (!content) return;
    setCommentLoading(true);
    try {
      const created = await api.post<{
        id: string;
        content: string;
        postId: string;
        userId: string;
        createdAt: string;
      }>(`/comment/${post.id}`, { content });
      const newComment: InlineComment = {
        id: created.id,
        content: created.content,
        postId: created.postId,
        userId: created.userId,
        createdAt: created.createdAt,
        user: user ? { id: user.id, username: user.username } : undefined,
      };
      setComments((prev) => [newComment, ...prev]);
      setVisibleCount((v) => v + 1);
      setCommentInput('');
      setShowComments(true);
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setCommentLoading(false);
    }
  }

  async function deleteComment(id: string) {
    if (!user) return;
    try {
      await api.delete(`/comment/${id}`);
      setComments((prev) => {
        const next = prev.filter((comment) => comment.id !== id);
        setVisibleCount((vc) => Math.min(vc, next.length));
        return next;
      });
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  }

  function toggleLike() {
    if (!user) return;
    setLikeLoading(true);
    try {
      if (isLiked) {
        api.delete(`/like/${post.id}`);
        setLikes((prev) => prev.filter((like) => like.userId !== user.id));
      } else {
        api
          .post<{
            id: string;
            userId: string;
            postId: string;
            createdAt: string;
          }>(`/like/${post.id}`)
          .then((created) => {
            setLikes((prev) => [
              ...prev,
              {
                id: created.id,
                userId: created.userId,
                postId: created.postId,
                createdAt: created.createdAt,
              },
            ]);
          });
      }
    } catch (err) {
      console.error('Like toggle failed', err);
    } finally {
      setLikeLoading(false);
    }
  }

  // Edit mode
  const [localTitle, setLocalTitle] = useState(post.title);
  const [localContent, setLocalContent] = useState(post.content);
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title);
  const [editedContent, setEditedContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  async function confirmEdit() {
    const trimmedTitle = editedTitle.trim();
    const trimmedContent = editedContent.trim();
    if (trimmedTitle.length < 3 || trimmedTitle.length > 24) {
      setEditError('Title must be between 3 and 24 characters.');
      return;
    }
    if (trimmedContent.length < 10 || trimmedContent.length > 240) {
      setEditError('Content must be between 10 and 240 characters.');
      return;
    }
    setEditError(null);
    setSaving(true);
    try {
      const updated = await api.put<{
        id: string;
        title: string;
        content: string;
      }>(`/post/${post.id}`, { title: trimmedTitle, content: trimmedContent });
      setLocalTitle(updated.title);
      setLocalContent(updated.content);
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update post', err);
      setEditError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // --- Styling and layout matches PostCard ---
  const commentItemHeight = 72; // px per comment (approx.)
  const inputAreaHeight = 56; // px for input + button area
  const loadMoreHeight = visibleCount < comments.length ? 36 : 0;
  const extraSpace = inputAreaHeight + loadMoreHeight + 16; // padding
  const computedMaxHeight = showComments
    ? Math.max(400, visibleCount * commentItemHeight + extraSpace)
    : 0;

  return (
    <article
      className='
        hover:shadow-clickable
        transition-all
        ease-in
        [&:has(a:active)]:active:scale-99
        [&:has(a:active)]:active:shadow-sm
        bg-surface
        border
        border-accent/30
        rounded-2xl
        shadow-2xs
        p-4
        mx-auto
        max-w-125
        w-full
        font-funnel
      '
    >
      <header
        className='
          grid
          grid-cols-2
          grid-rows-1
          items-center
          gap-2
        '
      >
        {editMode ? (
          <input
            value={editedTitle}
            onChange={(e) => {
              setEditedTitle(e.target.value);
              setEditError(null);
            }}
            maxLength={24}
            className='text-text text-[18px] font-inter font-bold w-full p-1 border border-accent/50 rounded bg-background'
          />
        ) : (
          <h2 className='text-text text-[18px] font-inter font-bold'>
            {localTitle}
          </h2>
        )}

        <time
          className='
            col-start-4
            col-end-6
            text-muted-text
            text-[12px]
            ml-auto
          '
          dateTime={post.createdAt}
        >
          {new Date(post.createdAt).toLocaleString()}
        </time>
      </header>

      {editMode ? (
        <>
          <textarea
            value={editedContent}
            onChange={(e) => {
              setEditedContent(e.target.value);
              setEditError(null);
            }}
            maxLength={240}
            rows={4}
            className='w-full mt-2 p-2 border border-accent/50 rounded bg-background text-[16px] text-text resize-none'
          />
          <div className='flex items-center justify-between mt-1 text-xs'>
            {editError && <span className='text-red-500'>{editError}</span>}
            <span className='ml-auto text-muted-text'>
              {editedContent.length}/240
            </span>
          </div>
        </>
      ) : (
        <p className='text-[16px] text-text wrap-break-word mt-2'>
          {localContent}
        </p>
      )}

      <footer
        className='
          text-sm
          text-muted-text
          mt-2
        '
      >
        <div
          className='
            flex
            items-center
          '
        >
          {user &&
            user.id === post.userId &&
            (editMode ? (
              <>
                <button
                  onClick={confirmEdit}
                  disabled={saving}
                  className='px-3 py-1 rounded-2xl border border-accent/50 bg-accent/60 text-text text-xs font-bold hover:bg-accent/80 transition-all ease-in cursor-pointer active:scale-99 disabled:opacity-50 hover:shadow-clickable active:shadow-sm'
                >
                  {saving ? 'Saving...' : 'Confirm'}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditError(null);
                  }}
                  disabled={saving}
                  className='px-3 py-1 rounded-2xl border border-accent/30 text-text text-xs hover:bg-accent/20 transition-all ease-in cursor-pointer active:scale-99 disabled:opacity-50 ml-1.5 hover:shadow-clickable active:shadow-sm'
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditedTitle(localTitle);
                  setEditedContent(localContent);
                  setEditError(null);
                  setEditMode(true);
                }}
                className='
                  px-3 py-1 rounded-2xl border border-accent/30
                  text-text text-xs hover:bg-accent/20
                  hover:border-accent/50 transition-all ease-in
                  cursor-pointer active:scale-99
                  hover:shadow-clickable
                  active:shadow-sm
                  shadow-clickable
                  bg-background
                '
              >
                Edit
              </button>
            ))}

          <div className='ml-auto flex items-center gap-2'>
            <button
              style={{ textShadow: '2px 2px 5px rgba(0,0,0,0.6)' }}
              onClick={toggleLike}
              disabled={likeLoading}
              aria-pressed={isLiked}
              className={`h-8 w-8 flex items-center justify-center text-[26px] rounded-full hover:shadow-clickable hover:border-background/70 transition-all ease-in-out cursor-pointer active:scale-99 active:shadow-sm ${isLiked ? 'text-red-600' : 'text-white'}`}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              ♥
            </button>
            <span>{likes.length}</span>

            <button
              style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.7)' }}
              onClick={() => setShowComments((s) => !s)}
              className='h-8 w-8 flex items-center justify-center text-slate text-[18px] rounded-full hover:shadow-clickable hover:border-background/70 transition-all ease-in-out cursor-pointer active:scale-99 active:shadow-sm'
              aria-expanded={showComments}
              title='Toggle comments'
            >
              💬
            </button>
            <span>{comments.length}</span>
          </div>
        </div>

        <div
          className='
            mt-2
            transition-all
            duration-200
            overflow-hidden
          '
          style={{ maxHeight: computedMaxHeight }}
        >
          <div
            className='
              bg-surface
              p-3
              rounded
            '
          >
            {comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              <ul
                className='
                  space-y-2
                  divide-y 
                  divide-muted-text/50
                '
              >
                {comments.slice(0, visibleCount).map((c) => (
                  <li
                    key={c.id}
                    className='
                      flex
                      items-start
                      justify-between
                      gap-2
                    '
                  >
                    <div>
                      <Link to={`/profile/${c.userId}`}>
                        <p className='text-sm font-semibold'>
                          {c.user?.username ?? c.userId}
                        </p>
                      </Link>
                      <p className='text-sm text-text'>{c.content}</p>
                      <small className='text-xs text-muted-text'>
                        {new Date(c.createdAt).toLocaleString()}
                      </small>
                    </div>
                    {user && c.userId === user.id && (
                      <button
                        onClick={() => deleteComment(c.id)}
                      className='px-3 py-1 rounded-2xl border border-accent/30 text-text text-xs hover:bg-accent/20 hover:border-accent/50 transition-all ease-in cursor-pointer active:scale-99 hover:shadow-clickable active:shadow-sm'
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className='mt-2 flex items-center justify-center gap-4'>
              {visibleCount > 5 && (
                <button
                  onClick={() => setVisibleCount((v) => Math.max(5, v - 5))}
                  className='text-sm text-slate underline cursor-pointer hover:text-text transition-all ease-in-out'
                >
                  Load less
                </button>
              )}

              {visibleCount < comments.length && (
                <button
                  onClick={() => setVisibleCount((v) => v + 5)}
                  className='text-sm text-slate underline cursor-pointer hover:text-text transition-all ease-in-out'
                >
                  Load more
                </button>
              )}
            </div>

            <div className='mt-3 flex gap-2'>
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder='Write a comment...'
                className='flex-1 p-2 border rounded bg-background'
                disabled={commentLoading || !user}
              />
              <button
                onClick={submitComment}
                disabled={commentLoading || !user}
                className='px-3 py-1 rounded-2xl border border-accent/30 text-text text-xs hover:bg-accent/20 hover:border-accent/50 transition-all ease-in cursor-pointer active:scale-99 hover:shadow-clickable active:shadow-sm'
              >
                {commentLoading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </article>
  );
}
