replies
on message click, show message menu
menu items
'replies'
onclick goto r/{msg.i}
r/:i
if not get:i.c
get c from cf
above chats show
show {m.t} of reply to message
replies to {truncate(msg.t)}
on reply message
send reply event to /parent

let all buttons fade change color using animejs on hover like search chats button on /+page.svelte

- search chatrooms
  1. create server route routes/r/search/+server.ts that works like POST on routes/+server.ts but uses search_by_vector and accepts arbritray filters in jsonbody.f, sort by params in jsonbody.s, and search string in jsonbody.s;
     let search_by_vector get only payload field 't' to display room tag;
  2. /r/+page.svelte that shows search input and makes request to /r/search and shows results;
     has add chatroom button at top right, onclick opens modal asking for tag(name) and description of chat room, makes POST request to /r, jsonbody {t: room tag, d, description};
     let each search result only show room tag, r.t and link to /r/{r.i};
  3. /r/+page.server.ts loads most recently active rooms to r/page;
     return json(search_by_payload({s: 'r'}, null, {key: 'l', direction: 'desc'}));

---

- join chatroom
  add join button above chats in /r/[i]
  that sends a PUT request to /r/[i]/j, in the request handler:
  error if not locals.user
  usr_rooms = get<string[]>(locals.user.i, 'r')
  usr_rooms.push(params.i)
  set(locals.user.i, rooms_string_array)
  return new Response()

---

- joined chat rooms page /r/u
  +page.server.ts: {
  error 401 if not locals.user
  rooms = get<string[]>(locals.user.i, 'r')
  return search_by_payload({s: 'r', has_id: rooms})}
  +page.svelte: {
  has 2 row text area as search input, on ctrl+enter or click search button
  }
- search joined chatrooms
  return json(search_by_payload({s: 'r'}, null, {key: 'l', direction: 'desc'}))
  also uses routes/r/search, so route
- search chatroom messages
- leave chatroom
- notifications
- pwa requirements
- style chat page
- get create chat room working
- search chatroom messages

- make send button in chat room full rounded
- make username closer to message
- onmount focus message input
- make chats scrollbar really thin and fully rounded and the same blue color as chats
- remove border from chats container
- remove border from message input except bottom border
- AI suggestions
  route
