


## Message 
```pseudocode
{
 id: string
 text: string
 user: User
 channel: Channel
 date: Date
}
```

## User
```pseudocode
{
 id: string
 username: string
}
```

## Channel
```pseudocode
{
 id: string
 name: string
 admin: User
}
```

## Chat
```pseudocode
{
 id: string
 users: User[]
 messages: Message[]
}
```



