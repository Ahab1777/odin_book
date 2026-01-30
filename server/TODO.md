TODOs

[] Likes
    [x] add likes schema for posts and comments
    [x] create likeRouter
    [x] like post
    [x] unlike post

[] Posts
    [x] create post
    [x] delete post
    [x] get post
    [x] get post index ( posts from current user + friends) (done within 'posts' branch and unmerged)
    [x] update/edit post
    [x] test if getPostIndex works
    [x] getUserPosts
    [x] getPostsIndex fetches avatars

[] Profile
    [x] getProfile
    [x] editProfile

[] Friends
    [x] befriend user
    [x] Unfriend user
    [x] getFriendships
    [x] getUnknownUsers
    [x] Implement pending friendship logic
    [x] getFriendships and getUnknownUsers also returns avatars

[] User 
    [x] Demo access
    [x] Password recovery
    [] Configure mail sender for password recovery
    [] password recovery token is sent through req.params
    [] logOut
    [] Limit demo requests
    [x] Add flag to demo content (Added as User classes)
    [] Add periodic wipe of demo-created content
    [] Request mail confirmation for account creation

[] Comment
 [X] Add comment
 [X] Delete comment

[] Miscellaneous 
    [] Route validation for admin
    [] test - admin can CRUD anything
    [] Prevent bad words
    [x] Remake all tests to check for non-normalized emails