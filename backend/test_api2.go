package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	loginPayload := map[string]interface{}{
		"email":    "superadmin@bku.ac.id",
		"password": "superadmin123",
	}
	body, _ := json.Marshal(loginPayload)

	resp, _ := http.Post("http://127.0.0.1:8000/api/auth/login", "application/json", bytes.NewBuffer(body))
	b, _ := ioutil.ReadAll(resp.Body)
	resp.Body.Close()
	fmt.Println(string(b))
}
