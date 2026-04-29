import type { BasicUser } from '../../../types/auth';
import { Link } from 'react-router';

export default function FriendCard(user: BasicUser) {
  return (
    <Link
      to={`/profile/${user.id}`}
      className='
      '
    >
      <article className='
                  flex 
                  items-center 
                  justify-between 
                  rounded-md 
                  border 
                  border-black/10 
                  bg-white 
                  px-4 
                  py-3 
                  transition-all
                  shadow-sm 
                  min-w-85 
                  max-w-100
                  hover:border
                  hover:shadow-clickable
                  hover:cursor-pointer
                  hover:bg-primary/20
                  active:scale-99
                  active:shadow-sm
                  '>
        <span className='font-medium text-brown'>{user.username}</span>
        <img
          src={user.avatar}
          alt={`${user.username}'s avatar`}
          className='h-10 w-10 rounded-full object-cover'
        />
      </article>
    </Link>
  );
}
