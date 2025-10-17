# User

Available endpoints:
- POST `/users/:userId`
- POST `/users/:userId/friends`
- POST `/users/:userId/matchHistory`
- GET `/users`
- GET `/users/count`
- GET `/users/:userId`
- GET `/users/:userId/friends`
- GET `/users/:userId/friends/count`
- GET `/users/:userId/matchHistory`
- GET `/users/:userId/matchHistory/count`
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

## POST `/users/:userId/friends/:friendId`

Used to add a friend to an user

Can return:
- 200 with response
```json
{
	"msg": "Friend added successfully"
}
```
- 400 with response (if no user is specified in header, or friend is the user specified in header, or friend is already added)
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

## POST `/users/:userId/matchHistory?game=<pong/tetris>`

Used to add a match result to an user to a specific game

Input needed :
```json
{
	"game": "<pong/tetris>"
	"opponent": "<the opponent's username>",
	"myScore": <my score>,
	"opponentScore": <the opponent's score>,
	"date": <seconds since Epoch (Date.now() return)>
}
```

Can return:
- 200 with response
```json
{
	"msg": "Match successfully saved to the blockchain"
}
```
- 400 with response (if no user is specified in header, or no opponent/p1Score/p2Score is specified in body, or opponent is the user specified in header, or a score is negative, or the game specified is invalid)
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

## GET `/users?iStart=<starting index (included)>&iEnd=<ending index (excluded)>`

Used to get the list of users

Can return:
- 200 with response (list of user objects (between iStart and iEnd))
```json
{
	"users":
	[
		{
			"username": "<the username>",
			"displayName": "<the display name>",
			"pong": {
				"wins": <the number of pong matches won>,
				"losses": <the number of pong matches lost>
			},
			"tetris": {
				"wins": <the number of tetris matches won>,
				"losses": <the number of tetris matches lost>
			}
		},
		...
	]
}
```
- 400 with response (if iStart/iEnd is missing, or iEnd < iStart)
```json
{
	"error": "<corresponding error>"
}
```
- 404 with response (if no users exist in the selected range)
```json
{
	"error": "<corresponding error>"
}
```

## GET `/users/count`

Used to get the number of users

Always returns:
- 200 with response
```json
{
	"n_users": <number of users>
}
```

## GET `/users/:userId`

Used to get an user

Can return:
- 200 with response (an user object)
```json
{
	"username": "<the username>",
	"displayName": "<the display name>",
	"pong": {
		"wins": <the number of pong matches won>,
		"losses": <the number of pong matches lost>
	},
	"tetris": {
		"wins": <the number of tetris matches won>,
		"losses": <the number of tetris matches lost>
	}
}
```
- 404 with response (if user does not exist)
```json
{
	"error": "<corresponding error>"
}
```

## GET `/users/:userId/friends?iStart=<starting index (included)>&iEnd=<ending index (excluded)>`

Used to get the friends of an user

Can return:
- 200 with response (list of friend objects (between iStart and iEnd))
```json
{
	"friends":
	[
		{
			"friendName": "<the friend's username>"
		},
		...
	]
}
```
- 400 with response (if iStart/iEnd is missing, or iEnd < iStart)
```json
{
	"error": "<corresponding error>"
}
```
- 404 with response (if user does not exist, or no friends exist in the selected range)
```json
{
	"error": "<corresponding error>"
}
```

## GET `/users/:userId/friends/count`

Used to get the number of friends of an user

Can return:
- 200 with response
```json
{
	"n_friends": <number of friends>
}
```
- 404 with response (if user does not exist)
```json
{
	"error": "<corresponding error>"
}
```

## GET `/users/:userId/matchHistory?game=<pong/tetris>&iStart=<starting index (included)>&iEnd=<ending index (excluded)>`

Used to get the match history of an user for a specific game

Can return:
- 200 with response (list of matches results (between iStart and iEnd))
```json
{
	"matchHistory":
	[
		{
			"score":
			{
				"p1": "<the name of the p1>",
				"p2": "<the name of the p2>",
				"p1Score": "<the score of the p1>",
				"p2Score": "<the score of the p2>",
				"date": <seconds since Epoch (Date.now() return)>
			},
			"tx": "<the transcaction hash>"
		},
		...
	]
}
```
- 400 with response (if iStart/iEnd does not exist, or iEnd < iStart, or the game specified is invalid)
```json
{
	"error": "<corresponding error>"
}
```
- 404 with response (if user does not exist, or no matches exist in the selected range)
```json
{
	"error": "<corresponding error>"
}
```

## GET `/users/:userId/matchHistory/count?game=<pong/tetris>`

Used to get the number of matches an user played for a specific game

Can return:
- 200 with response
```json
{
	"n_matches": <number of matches played by the user>
}
```
- 400 with response (if game does not exist)
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

## PATCH `/users/:userId/:member`

Used to modify a member of an user (only displayName can be modified)

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

Used to delete an user

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

Used to delete a member of an user (only displayName can be deleted)

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

Used to delete the friends of an user

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

Used to delete a friend of an user

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

## DELETE `/users/:userId/matchHistory?game=<pong/tetris>`

Used to delete the match history of an user for a specific game

Can return:
- 200 with response
```json
{
	"msg": "Match history deleted successfully"
}
```
- 400 with response (if user specified in header is neither admin nor user, or the game specified is invalid)
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
