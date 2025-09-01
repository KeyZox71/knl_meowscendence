# Register

Available endpoints:
- `/register`
- `/register/google`
- `/register/google/callback`

Common return:
- 500 with response 
```json
{
    "error": "Internal server error"
}
```

## `/register`

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

## `/register/google`

Does not take input

Always return:
- redirect to the google auth url

## `/register/google/callback`

inputs are filled by google

Can return:
- 400 with response
