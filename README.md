# Cashbask Service Challenge

## Requirements
- node 8

## Running Docker-Compose
``` bash
    # Change the file .env.example to .env
    mv .env.example .env

    # Create access log file
    mkdir ./tmp/logs && touch ./tmp/logs/access.log

    # Create activated_login file - easy access to url used to activate new users
    mkdir ./tmp/activated_logins && touch ./tmp/activated_logins/activated_login_url.txt

    # Run API
    docker-compose up
```

# Routes
```
    ##### AUTH #####

    # Authenticate
	POST /api/v1/auth
	BODY
	    email: required
	    password: required
	RETURNS
	    token

    # Return Logged User Data
	GET /api/v1/auth
    HEADERS
	    Authorization: token
	RETURNS
	    user

    # Activate User Login 
	GET /api/v1/auth/activatelogin/:token
	RETURNS
	    204

    ##### USERS #####

    # Create
	POST /users
	BODY
	    name: required
        username: required
	    personalDocument: required
	    email: required
	    password: required
	RETURNS
	    user

    # Get the amount of cashback
	GET /users/mycash
	HEADERS
	    Authorization: token
	RETURNS
	    credit

    # List
    GET /users/
	HEADERS
	    Authorization: token
	RETURNS
	    users

    # Delete
    DELETE /users/:id
	HEADERS
	    Authorization: token
	RETURNS
	    204

    # Update
    PATCH /users/:id
    BODY
	    name: optional
        username: optional
	    personalDocument: optional
	    email: optional
	HEADERS
	    Authorization: token
	RETURNS
	    200

    ##### ORDERS #####

    # List
	GET /orders
	HEADERS
	    Authorization: token
	RETURNS
	    orders

    # Create
	POST /orders
	BODY
	    price: required
	    personalDocument: required
        code: required
	    date: optional
	HEADERS
	    Authorization: token
	RETURNS
	    order

    # Delete
	DELETE /orders/:id
	HEADERS
	    Authorization: token
	RETURNS
	    204
```


## Running Tests with Docker
``` bash
    # Change the file .env.example to .env
    mv .env.example .env

    # Create access log file
    mkdir ./tmp/logs && touch ./tmp/logs/access.log

    # Create activated_login file - easy access to url used to activate new users
    mkdir ./tmp/activated_logins && touch ./tmp/activated_logins/activated_login_url.txt

    # Run mongo on docker
    docker-compose up -d mongo

    # Install packages
    yarn

    # Run Tests
    yarn run test
```

## Seed
``` bash
    # Change the file .env.example to .env
    mv .env.example .env

    # Run mongo on docker
    docker-compose up -d mongo

    # Install packages
    yarn

    # Run Tests
    yarn run seed
```
