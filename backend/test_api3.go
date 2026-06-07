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
	var loginRes map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&loginRes)
	resp.Body.Close()

	data := loginRes["data"].(map[string]interface{})
	token := data["access_token"].(string)

	req, _ := http.NewRequest("GET", "http://127.0.0.1:8000/api/admin/ormawa", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp2, _ := client.Do(req)
	b, _ := ioutil.ReadAll(resp2.Body)
	resp2.Body.Close()

	fmt.Println(string(b))
}
