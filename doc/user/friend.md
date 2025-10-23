# Friend

Available endpoints:
- POST `/users/:userId/friends`
- GET `/users/:userId/friends`
- GET `/users/:userId/friends/count`
- DELETE `/users/:userId/friends`
- DELETE `/users/:userId/friends/:friendId`

Common return:
- 500 with response 
```json
{
	"error": "Internal server error"
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

## GET `/users/:userId/friends?iStart=<starting index (included)>&iEnd=<ending index (excluded)>`

Used to get the friends of an user

Can return:
- 200 with response (list of friend objects (between iStart and iEnd))
```json
{
	"friends":
	[
		{
			"friendName": "<the friend's username>",
			"friendDisplayName": "<the friend's display name>"
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
