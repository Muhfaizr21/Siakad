package main

import (
	"fmt"
	"log"
	"siakad-backend/config"
)

func main() {
	config.ConnectDB()
	
	fmt.Println("Updating student statuses using Raw SQL...")
	
	// Cuti: 500
	err := config.DB.Exec(`
		UPDATE mahasiswas 
		SET status_akun = 'Cuti' 
		WHERE id IN (SELECT id FROM mahasiswas ORDER BY id LIMIT 500)
	`).Error
	if err != nil { log.Fatal(err) }
	fmt.Println("Updated 500 to 'Cuti'")
	
	// DO: 200
	err = config.DB.Exec(`
		UPDATE mahasiswas 
		SET status_akun = 'DO' 
		WHERE id IN (SELECT id FROM mahasiswas ORDER BY id OFFSET 500 LIMIT 200)
	`).Error
	if err != nil { log.Fatal(err) }
	fmt.Println("Updated 200 to 'DO'")

	// Lulus: 300
	err = config.DB.Exec(`
		UPDATE mahasiswas 
		SET status_akun = 'Lulus' 
		WHERE id IN (SELECT id FROM mahasiswas ORDER BY id OFFSET 700 LIMIT 300)
	`).Error
	if err != nil { log.Fatal(err) }
	fmt.Println("Updated 300 to 'Lulus'")
	
	fmt.Println("Database update complete.")
}
