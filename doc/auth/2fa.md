# 2fa

Abailable endpoints:
- POST `/2fa`
- POST `/2fa/verify`
- DELETE `/2fa`

Common return:
- 500 with response 
```json
{
    "error": "Internal server error"
}
```

## POST `/2fa`

Used to enable 2fa (need to verify after to confirm)

Inputs: just need a valid JWT cookie

Returns:
- 200
```json
{
    "secret": "<the generated secret>"
    "otpauthUrl": "<the generated url>"
}
```

## POST `/2fa/verify`

Used to confirm 2fa

Inputs: a valid JWT in cookie and
```json
{
    "token": "<token given by 2fa>"
}
```

Returns: 
- 200
```json
{
    "msg": "2FA verified successfully"
}
```
- 401 || 400 || 404
```json
{
    "error": "<corresponding error>"
}
```

## DELETE `/2fa`

Used to remove 2fa

Inputs: a valid JWT in cookie

Returns: 
- 200
```json
{
    "msg": "TOTP removed"
}
```
