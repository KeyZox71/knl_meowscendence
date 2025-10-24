# Avatar

Available endpoints:
- POST `/users/:userId/avatar`
- GET `/users/:userId/avatar`
- PATCH `/users/:userId/avatar`
- DELETE `/users/:userId/avatar`

Common return:
- 500 with response 
```json
{
    "error": "Internal server error"
}
```

## POST /users/:userId/avatar

Used to upload an avatar

Input needed :
```json
{
	<FormData object containing the file>
}
```

Can return:
- 200 with response
```json
{
	"msg": "Avatar uploaded successfully"
}
```
- 400 with response (if the file is too large, or file is missing, or it is missing a file name, or it is missing a mime type)
```json
{
	"error": "<corresponding error>"
}
```
- 404 with response (if the user does not exist)
```json
{
	"error": "<corresponding error>"
}
```

## GET /users/:userId/avatar

Used to download an avatar

Input needed :
```json
{
	<FormData object containing the file>
}
```

Can return:
- 200 with response
```json
{
	"msg": "Avatar uploaded successfully"
}
```
- 404 with response (if the user does not exist, or the user does not have an assigned avatar, or the image does not exist)
```json
{
	"error": "<corresponding error>"
}
```

## PATCH /users/:userId/avatar

Used to modify an avatar

Input needed :
```json
{
	<FormData object containing the file>
}
```

Can return:
- 200 with response
```json
{
	"msg": "Avatar modified successfully"
}
```
- 400 with response (if the file is too large, or file is missing, or it is missing a file name, or it is missing a mime type)
```json
{
	"error": "<corresponding error>"
}
```
- 404 with response (if the user does not exist)
```json
{
	"error": "<corresponding error>"
}
```

## DELETE /users/:userId/avatar

Used to delete an avatar

Can return:
- 200 with response
```json
{
	"msg": "Avatar deleted successfully"
}
```
- 404 with response (if the user does not exist, or the user does not have an assigned avatar)
```json
{
	"error": "<corresponding error>"
}
```
