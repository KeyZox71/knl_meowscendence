# Logout

Available endpoints:
- GET `/logout`

Common return:
- 500 with response
```json
{
    "error": "Internal server error"
}
```

## GET `/logout`

Used to logout the client (it just delete the cookie)

Returns:
- 200 with response and clear cookie
```json
{
    "msg": "Logout successful"
}
```
