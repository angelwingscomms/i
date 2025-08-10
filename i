ake update profile button on home change color on hover, adjust the design system so all buttons do            │
│   this; "You don't have a description yet..." on u/:i only shows if the user being viewed is not the logged       │
│   in user; add a 'dc' field on the user type (date created); set dc to Date.now() on user create; sync            │
│   search query on /u to localStorage; on /u load, if searchquery show search results for search query else        │
│   show most recently joined users            

make token_count function in lib/util that uses google/genai (t: string): number => <number of tokens in string>

make get_message_token_count in lib/util/chat/ (m: {r: receiver, d: date-number, m: message_text}) => number
    lastmessage = searchbypayload(filters: r = m.r, d < message.d, with payload: 'tc')
    return tc + token_count(message.tc)
    
onmessage, get token count of last message w/ same 'r' field, of no m

make ChatBox component that only shows chat ui from Chat component
    props
        onsend
        messages: ChatMessage[]
        text: $bindable() : string
        
Rename <Chat> to <UserChat>
UserChat now uses <Chatbox>

AI chat
    Uses Chatbox
        onsend: axios.post('/i/<user_id>')
    /u/:i/server.ts POST
        
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
    

