import type { UserPostCardContent } from '../../types/auth';
import { Link } from 'react-router';

export default function UserPostCard(post: UserPostCardContent) {
  return (
    <Link //Title
      to={`/post/${post.id}`}
        className='
        hover:shadow-clickable
        transition-all
        ease-in
        bg-surface
        border
        border-accent/30
        rounded-2xl
        shadow-2xs
        p-4
        mx-auto
        max-w-[500px]
        w-full
        font-funnel
      '
    >
      <article>
        <header
          className='
      grid
      grid-cols-2
      grid-rows-1
      items-center
      gap-2
      '
        >
          <h2
            className='
          text-text
          text-[18px]
          font-inter
          font-bold
            '
          >
            {post.title}
          </h2>
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
        <p
          className='
      text-[16px]
      text-text
        wrap-break-word
        mt-2
        '
        >
          {post.content}
        </p>
        <footer className='mt-2 flex items-center justify-end gap-4 text-sm text-slate'>
          <span>❤️ {post.likes.length}</span>
          <span>💬 {post.comments.length}</span>
        </footer>
      
      
      
      </article>
    </Link>
  );
}
