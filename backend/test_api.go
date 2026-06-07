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
		"superadmin123": "password",
	}
	body, _ := json.Marshal(loginPayload)

	resp, err := http.Post("http://127.0.0.1:8000/api/auth/login", "application/json", bytes.NewBuffer(body))
	if err != nil {
		fmt.Println("Login Error:", err)
		return
	}
	defer resp.Body.Close()

	var loginRes map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&loginRes)
	
	token, ok := loginRes["token"].(string)
	if !ok {
		fmt.Println("No token found")
		return
	}

	req, _ := http.NewRequest("GET", "http://127.0.0.1:8000/api/admin/ormawa", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp2, _ := client.Do(req)
	defer resp2.Body.Close()

	b, _ := ioutil.ReadAll(resp2.Body)
	fmt.Println(string(b))
}
