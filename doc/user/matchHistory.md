# Match History

Available endpoints:
- POST `/users/:userId/matchHistory`
- GET `/users/:userId/matchHistory`
- GET `/users/:userId/matchHistory/count`
- DELETE `/users/:userId/matchHistory`

Common return:
- 500 with response 
```json
{
	"error": "Internal server error"
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
