style /r/:/page so save room shows well
make update profile button on home change color on hover, adjust the design system so all buttons do, except for disabled buttons     
this
"You don't have a description yet..." on u/:i only shows if the user being viewed is not the logged in user (self). if self, show the user's description, copy that says 'other users can only see what the have in common with you', and a button that says 'update your description'
add a 'dc' field (number) on the user type (date created) 
set dc to Date.now() on user create
on /u pageload, search_by_vector for users using user description and return {results: r} and use those results on page.svelte

make token_count function in lib/util that uses google/genai using gemini-2.5-flash: (t: string): number => <number of tokens in string>

make get_message_token_count in lib/util/chat/ (m: {r: receiver, d: date-number, m: message_text}) => number
    lastmessage = searchbypayload(filters: r = m.r, d < message.d, with payload: 'tc')
    return lastmessage.tc + token_count(message.tc)
make process_message function that receives DB message and returns it, updated. for now it just updates message.tc
use process_message on /u/:i/c/+server.ts and /r/:i/+server.ts

make ChatBox component that only shows chat ui from Chat component
    props
        onsend
        messages: ChatMessage[]
        text: $bindable() : string
        
Rename <Chat> to <UserChat>
UserChat now uses <Chatbox>

AI chat
    /i/c
    Uses Chatbox
        onsend: axios.post('/i')
        server /i/+server.ts
            works like  /r/:i/+server.ts
                in await create
                    requires locals.user
                    u: locals.user.i
                    s: 'i' // tenant_id for ai chats
                    i: 0 if message was from user, 1 if from the ai
                    string_to_embed: same w/ /i/+server.ts, but without room_name_or_tag
        
    desc = describe a person that would be a great friend to a person with this description {user_description}
    use desc AI chat system prompt
    tools
        search_messages
        search_users
        search_groups
    
    refactor search_messages function from '/r/:i/+page.server.ts
        args
            search string (to embed)
            u? (sender)
            r? (receiver)
            s? (date start for date range)
            e? (date end for date range)
    use AI to search for groups and messages so AI embeds({name: description}) format
    

---
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
- unsave chatroom
- style chat page
- get create chat room working
- search chatroom messages

- make send button in chat room full rounded
- make username closer to message
- onmount focus message input
- make chats scrollbar really thin and fully rounded and the same blue color as chats
- remove border from chats container
- remove border from message input except bottom border, let all text inputs look like that in the design system
- AI suggestions
  route
