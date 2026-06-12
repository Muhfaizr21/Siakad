package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	hash := "$2a$10$3qlvxF3hgFr22iLIT6O31eTWAvOKeXJmhE8EQWlYWD8UKyoZmXoWq"
	password := "12345678"
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		fmt.Println("No, it's not 12345678")
	} else {
		fmt.Println("Yes, it is 12345678")
	}
}
