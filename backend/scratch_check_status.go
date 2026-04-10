package main

import (
	"fmt"
	"siakad-backend/config"
)

func main() {
	config.ConnectDB()
	
	type Result struct {
		Status string
		Count  int64
	}
	var results []Result
	
	config.DB.Table("mahasiswas").
		Select("status_akun as status, count(*) as count").
		Group("status_akun").
		Scan(&results)
	
	fmt.Println("Status Akun Distribution:")
	for _, r := range results {
		fmt.Printf("- %s: %d\n", r.Status, r.Count)
	}

	var results2 []Result
	config.DB.Table("mahasiswas").
		Select("status_akademik as status, count(*) as count").
		Group("status_akademik").
		Scan(&results2)
	
	fmt.Println("\nStatus Akademik Distribution:")
	for _, r := range results2 {
		fmt.Printf("- %s: %d\n", r.Status, r.Count)
	}
}
