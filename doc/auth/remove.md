# remove user

Available endpoints:
- DELETE `/`

Common return:
- 500 with response 
```json
{
    "error": "Internal server error"
}
```

## DELETE `/`

User to remove a user from the backend

Inputs: just need a valid JWT cookie

Returns:
- 200
```json
{
    "msg": "User successfully deleted"
}
```
- 401 || 400
```json
{
    "error": "<corresponding msg>
}
```
