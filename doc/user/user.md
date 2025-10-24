# User

Available endpoints:
- POST `/users/:userId`
- GET `/users`
- GET `/users/count`
- GET `/users/:userId`
- PATCH `/users/:userId/:member`
- DELETE `/users/:userId`
- DELETE `/users/:userId/:member`

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
