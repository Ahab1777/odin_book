import { useState, useEffect } from 'react';
import type { PostCardContent, Like, Comment } from '../../types/content';
import { Link } from 'react-router';
import { useAuth } from '../auth';
import { api } from '../../lib/api';

type PostWithExtras = PostCardContent & {
  likes?: Like[];
  comments?: Comment[];
};

type InlineComment = Comment & { user?: { id: string; username: string } };

export default function PostCard(post: PostWithExtras) {
  const { user } = useAuth();

  const [likes, setLikes] = useState<Like[]>(post.likes ?? []);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLikes(post.likes ?? []);
  }, [post.likes]);

  useEffect(() => {
    setIsLiked(Boolean(user && likes.some((l) => l.userId === user.id)));
  }, [likes, user]);

  // Comments
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<InlineComment[]>(
    post.comments ?? []
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

  async function toggleLike() {
    if (!user) return;
    setLoading(true);
    try {
      if (isLiked) {
        await api.delete(`/like/${post.id}`);
        setLikes((prev) => prev.filter((like) => like.userId !== user.id));
      } else {
        const created = await api.post<{
          id: string;
          userId: string;
          postId: string;
          createdAt: string;
        }>(`/like/${post.id}`);
        setLikes((prev) => [
          ...prev,
          {
            id: created.id,
            userId: created.userId,
            postId: created.postId,
            createdAt: created.createdAt,
          },
        ]);
      }
    } catch (err) {
      console.error('Like toggle failed', err);
    } finally {
      setLoading(false);
    }
  }

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
    hover:animate-color-cycle-background
    border
    border-accent/30
    rounded-2xl
    shadow-2xs
    hover:shadow-2xs
    p-4
    mx-auto
    max-w-[500px]
    w-full

      '
    >
      <header
        className='
          grid
          grid-cols-5
          grid-rows-2
          items-center
          gap-2
          col-first-width-50
        '
      >
        <Link //avatar
          to={`/profile/${post.userId}`}
          className='
            col-start-1
            col-end-2
            rounded-full
            
          '
        >
          <img
            className='
            rounded-full
            border
            border-accent/30
            hover:shadow-clickable
            transition-all
            ease-out
            duration-200
            h-10
            w-10
            mr-auto
            '
            src={post.user.avatar}
            alt={`${post.user.username}'s avatar`}
          />
        </Link>
          <Link //username
            to={`/profile/${post.userId}`}
            className='
            text-text
            col-start-2
            col-end-3
          '
          >
          <h3
            className='
          text-text
          text-[14px]
            '
          >{post.user.username}</h3>
          </Link>
        <Link //Title
          to={`/post/${post.id}`}
          className='
          font-bold
          text-text
          col-span-3
          col-start-1
          col-end-6
          row-start-2
          '
        >
          <h2
            className='
          text-text
          text-[20px]
            '
          >{post.title}</h2>
        </Link>
      </header>
      <p>{post.content}</p>
      <footer
        className='
          text-sm
          text-slate
        '
      >
        <div
          className='
            flex
            items-center
            justify-between
          '
        >
          <time dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleString()}
          </time>

          <div
            className='
              flex
              items-center
              gap-2
            '
          >
            <button
              onClick={toggleLike}
              disabled={loading}
              aria-pressed={isLiked}
              className={`
                px-2
                py-1
                rounded
                ${isLiked ? 'text-red-600' : 'text-slate'}
              `}
              title={isLiked ? 'Unlike' : 'Like'}
            >
              {isLiked ? '♥' : '♡'}
            </button>
            <span>{likes.length}</span>

            <button
              onClick={() => setShowComments((s) => !s)}
              className='
                px-2
                py-1
                rounded
                text-slate
              '
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
              bg-slate-50
              p-3
              rounded
            '
          >
            {comments.length === 0 ? (
              <p
                className='
                  text-slate
                '
              >
                No comments yet.
              </p>
            ) : (
              <ul
                className='
                  space-y-2
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
                      <p
                        className='
                          text-sm
                          font-semibold
                        '
                      >
                        {(c as InlineComment).user?.username ?? c.userId}
                      </p>
                      <p
                        className='
                          text-sm
                          text-slate
                        '
                      >
                        {c.content}
                      </p>
                      <small
                        className='
                          text-xs
                          text-slate
                        '
                      >
                        {new Date(c.createdAt).toLocaleString()}
                      </small>
                    </div>
                    {user && c.userId === user.id && (
                      <button
                        onClick={() => deleteComment(c.id)}
                        className='
                          text-red-600
                          ml-2
                        '
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div
              className='
                mt-2
                flex
                items-center
                justify-center
                gap-4
              '
            >
              {visibleCount > 5 && (
                <button
                  onClick={() => setVisibleCount((v) => Math.max(5, v - 5))}
                  className='
                    text-sm
                    text-slate
                    underline
                  '
                >
                  Load less
                </button>
              )}

              {visibleCount < comments.length && (
                <button
                  onClick={() => setVisibleCount((v) => v + 5)}
                  className='
                    text-sm
                    text-slate
                    underline
                  '
                >
                  Load more
                </button>
              )}
            </div>

            <div
              className='
                mt-3
                flex
                gap-2
              '
            >
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder='Write a comment...'
                className='
                  flex-1
                  p-2
                  border
                  rounded
                '
                disabled={commentLoading || !user}
              />
              <button
                onClick={submitComment}
                disabled={commentLoading || !user}
                className='
                  btn
                  btn-primary
                '
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
