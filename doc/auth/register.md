# Register

Available endpoints:
- POST `/register`
- GET `/register/google`
- GET `/register/google/callback`

Common return:
- 500 with response 
```json
{
    "error": "Internal server error"
}
```

## POST `/register`

Used to register

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
    "msg": "Register successfully"
}
```
- 400 with response
```json
{
    "error": "<corresponding error>"
}
```

## GET `/register/google`

Used to redirect to the google auth page

Always return:
- redirect to the google auth url

## GET `/register/google/callback`

Used to get the callback from google and register

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
    "msg": "Register successfully"
}
```
