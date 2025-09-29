# User

Available endpoints:
- POST `/users/:userId`
- POST `/users/:userId/friends`
- POST `/users/:userId/matchHistory`
- GET `/users`
- GET `/users/:userId`
- GET `/users/:userId/friends`
- GET `/users/:userId/matchHistory`
- PATCH `/users/:userId/:member`
- DELETE `/users/:userId`
- DELETE `/users/:userId/:member`
- DELETE `/users/:userId/friends`
- DELETE `/users/:userId/friends/:friendId`
- DELETE `/users/:userId/matchHistory`

Common return:
- 500 with response 
```json
{
	"error": "Internal server error"
}
```

## POST `/users/:userId`

Used to create an user

Input needed :
```json
{
	"displayName": "<the display name>"
}
```

Can return:
- 200 with response
```json
{
	"msg": "User created successfully"
}
```
- 400 with response (if no user is specified in header, or user already exists, or no display name is specified in body)
```json
{
	"error": "<corresponding error>"
}
```
- 401 with response (if user specified in header is not admin)
```json
{
	"error": "<corresponding error>"
}
```

## POST `/users/:userId/friends`

Used to add a friend

Input needed :
```json
{
	"friend": "<the friend's username>"
}
```

Can return:
- 200 with response
```json
{
	"msg": "Friend added successfully"
}
```
- 400 with response (if no user is specified in header, or friend is the user specified in header, or no friend is specified in body)
```json
{
	"error": "<corresponding error>"
}
```
- 404 with response (if user does not exist, or friend does not exist)
```json
{
	"error": "<corresponding error>"
}
```
- 401 with response (if user specified in header is neither admin nor user)
```json
{
	"error": "<corresponding error>"
}
```

## POST `/users/:userId/matchHistory`

Used to add a match result

Input needed :
```json
{
	"opponent": "<the opponent's username>",
	"p1Score": <player 1's score>,
	"p2Score": <player 2's score>
}
```

Can return:
- 200 with response
```json
{
	"msg": "Match successfully saved to the blockchain"
}
```
- 400 with response (if no user is specified in header, or no opponent/p1Score/p2Score is specified in body, or opponent is the user specified in header, or a score is negative)
```json
{
	"error": "<corresponding error>"
}
```
- 404 with response (if user does not exist, or opponent does not exist)
```json
{
	"error": "<corresponding error>"
}
```
- 401 with response (if user specified in header is neither admin nor user)
```json
{
	"error": "<corresponding error>"
}
```

## GET `/users`

Used to get the user list

Always returns:
- 200 with response (list of user objects)
```json
[
	{
		"username": "<the username>",
		"displayName": "<the display name>",
		"wins": <the number of matches won>,
		"losses": <the number of matches lost>
	},
	...
]
```

## GET `/users/:userId`

Used to get an user

Can return:
- 200 with response (an user object)
```json
{
	"username": "<the username>",
	"displayName": "<the display name>",
	"wins": <the number of matches won>,
	"losses": <the number of matches lost>
}
```
- 404 with response (if user does not exist)
```json
{
	"error": "<corresponding error>"
}
```

## GET `/users/:userId/friends`

Used to the friends of a user

Can return:
- 200 with response (list of friend objects)
```json
[
	{
		"friendName": "<the friend's username>"
	},
	...
]
```
- 404 with response (if user does not exist, or user does not have friends)
```json
{
	"error": "<corresponding error>"
}
```

## GET `/users/:userId/matchHistory`

Used to the match history of a user

Input needed :
```json
{
	"iStart": <the index of the first match>,
	"iEnd": <the id of the last match>
}
```

Can return:
- 200 with response (list of matches results (between iStart and iEnd))
```json
[
	{
		"score":
		{
			"p1": "<the name of the p1>",
			"p2": "<the name of the p2>",
			"p1Score": "<the score of the p1>",
			"p2Score": "<the score of the p2>"
		},
		"tx": "<the transcaction hash>"
	},
	...
]
```
- 400 with response (if iStart/iEnd does not exist, or iEnd < iStart)
```json
{
	"error": "<corresponding error>"
}
```
- 404 with response (if user does not exist, or user did not play any matches)
```json
{
	"error": "<corresponding error>"
}
```

## PATCH `/users/:userId/:member`

Used to modify the member of a user (only displayName can be modified)

Input needed :
```json
{
	"<the member to modify (must be identical to :member)>": "<the member's new value>"
}
```

Can return:
- 200 with response
```json
{
	"msg": "<:member> modified sucessfully"
}
```
- 400 with response (if no user is specified in header, or new value of member to modify is not provided in the body, or member does not exist)
```json
{
	"error": "<corresponding error>"
}
```
- 404 with response (if user does not exist)
```json
{
	"error": "<corresponding error>"
}
```
- 401 with response (if user specified in header is not admin)
```json
{
	"error": "<corresponding error>"
}
```

## DELETE `/users/:userId`

Used to delete a user

Can return:
- 200 with response
```json
{
	"msg": "User deleted successfully"
}
```
- 404 with response (user does not exist)
```json
{
	"error": "<corresponding error>"
}
```

## DELETE `/users/:userId/:member`

Used to delete a member (only displayName can be deleted)

Can return:
- 200 with response
```json
{
	"msg": "<:member> deleted successfully"
}
```
- 401 with response (if user specified in header is neither admin nor user)
```json
{
	"error": "<corresponding error>"
}
```
- 400 with response (if no user is specified in header, or member to delete does not exist)
```json
{
	"error": "<corresponding error>"
}
```
- 404 with response (if user does not exist)
```json
{
	"error": "<corresponding error>"
}
```

## DELETE `/users/:userId/friends`

Used to delete friends

Can return:
- 200 with response
```json
{
	"msg": "Friends deleted successfully"
}
```
- 400 with response (if user specified in header is neither admin nor user)
```json
{
	"error": "<corresponding error>"
}
```
- 401 with response (if user specified in header is neither admin nor user)
```json
{
	"error": "<corresponding error>"
}
```
- 404 with response (if user does not exist)
```json
{
	"error": "<corresponding error>"
}
```

## DELETE `/users/:userId/friends/:friendId`

Used to delete a friend

Can return:
- 200 with response
```json
{
	"msg": "Friend deleted successfully"
}
```
- 400 with response (if user specified in header is neither admin nor user)
```json
{
	"error": "<corresponding error>"
}
```
- 401 with response (if user specified in header is neither admin nor user)
```json
{
	"error": "<corresponding error>"
}
```
- 404 with response (if user does not exist, or friend does not exist)
```json
{
	"error": "<corresponding error>"
}
```

## DELETE `/users/:userId/matchHistory`

Used to delete the match history

Can return:
- 200 with response
```json
{
	"msg": "Match history deleted successfully"
}
```
- 400 with response (if user specified in header is neither admin nor user)
```json
{
	"error": "<corresponding error>"
}
```
- 401 with response (if user specified in header is neither admin nor user)
```json
{
	"error": "<corresponding error>"
}
```
- 404 with response (if user does not exist)
```json
{
	"error": "<corresponding error>"
}
```
