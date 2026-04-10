package main

import (
	"fmt"
	"siakad-backend/config"
)

func main() {
	config.ConnectDB()
	
	tables := []string{"mahasiswas", "program_studis"}
	for _, tableName := range tables {
		var columns []struct {
			ColumnName string `gorm:"column:column_name"`
		}
		
		config.DB.Raw(`
			SELECT column_name 
			FROM information_schema.columns 
			WHERE table_name = ?
		`, tableName).Scan(&columns)
		
		fmt.Printf("Columns for table %s:\n", tableName)
		for _, col := range columns {
			fmt.Printf("- %s\n", col.ColumnName)
		}
		fmt.Println()
	}
}
