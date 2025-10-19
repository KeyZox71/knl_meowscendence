# ping

Available endpoints:
- POST `/ping`
- GET `/ping/:userId`

Common return:
- 500 with response 
```json
{
    "error": "Internal server error"
}
```

## POST `/ping`

Used to send a ping and update the lastSeenTime (can be used for activity time)

Input needed : just need a valid token

Can return:
- 200
```json
{
    "msg": "last seen time updated successfully"
}
```

## GET `/ping/:userId`

Used to retrive the lastSeenTime of a user

Input needed : just need a valid token

Can return:
- 200
```json
{
    "lastSeenTime": "<last seen time>"
}
```
