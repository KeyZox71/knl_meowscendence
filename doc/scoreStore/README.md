# scoreStore

Available endpoints:
- GET '/:id'
- POST '/'

Common return:
- 500 with response 
```json
{
    "error": "Internal server error"
}
```

## GET `/:id`

Used to get an score from the blockchain (the id is the one returned when a score is added)

Inputs:
:id : the id of the score

Returns:
- 200
```json
{
    "score": {
        "p1": "<the name of the p1>",
        "p2": "<the name of the p2>",
        "p1Score": "<the score of the p1>",
        "p2Score": "<the score of the p2>"
    },
    "tx": "<the transcaction hash>"
}
```

## POST `/`

Used to add a new score (note that those can't be removed after added)

Inputs (this one need to be the same as the following otherwise you will have an error 500):
```json
{
    "p1": "<name of the p1>",
    "p2": "<name of the p2>",
    "p1Score": "<score of the p1>",
    "p2Score": "<score of the p2>"
}
```

Returns:
- 200
```json
{
    "id": "<the id of the added score>"
}
```
