module onetimer-backend-tests

go 1.21

replace onetimer-backend => ../

require (
	onetimer-backend v0.0.0-00010101000000-000000000000
	github.com/stretchr/testify v1.8.4
	github.com/gofiber/fiber/v2 v2.52.0
)

require (
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/pmr/gounidecode v0.0.0-20150809073036-a14dfa0b3210 // indirect
	github.com/stretchr/objx v0.5.0 // indirect
)