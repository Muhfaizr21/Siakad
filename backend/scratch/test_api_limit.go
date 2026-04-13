package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

func main() {
	keyword := "Universitas Bhakti Kencana"
	fullURL := fmt.Sprintf("https://api-pddikti.kemdiktisaintek.go.id/pencarian/mhs/%s", url.PathEscape(keyword))
	
	req, _ := http.NewRequest("GET", fullURL, nil)
	req.Header.Set("Origin", "https://pddikti.kemdiktisaintek.go.id")
	req.Header.Set("Referer", "https://pddikti.kemdiktisaintek.go.id/")
	req.Header.Set("Accept", "application/json, text/plain, */*")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer resp.Body.Close()
	
	body, _ := io.ReadAll(resp.Body)
	
	var mhsList []interface{}
	json.Unmarshal(body, &mhsList)
	
	fmt.Printf("Total results returned by API for '%s': %d\n", keyword, len(mhsList))
}
