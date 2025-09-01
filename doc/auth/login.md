# Login

Abailable endpoints:
- POST `/login`
- GET `/login/google`
- GET `/login/google/callback`

Common return:
- 500 with response 
```json
{
    "error": "Internal server error"
}
```

## POST `/login`

Used to login

Input needed :
```json
{
    "user": "<string>",
    "password": "<string>"
}
```

Can return: 
- 200 with response and cookie in header
```json
{
    "msg": "Login successfully"
}
```
- 400 with response
```json
{
    "error": "<corresponding error>"
}
```

## GET `/login/google`

Used to redirect the user to the login page for google auth

Always return:
- redirect to the google auth url

## GET `/login/google/callback`

Used to get the callback from google and confirm the login

Can return:
- 400 with response
```json
{
    "error": "<corresponding error>"
}
```
- 200 with response and cookie in header
```json
{
    "msg": "Login successfully"
}
```
