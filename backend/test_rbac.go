package main

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
)

func main() {
	config.ConnectDB()
	var role models.RBACRole
	if err := config.DB.Where("key = ?", "faculty_admin").First(&role).Error; err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Old Permissions:", string(role.Permissions))
	role.Permissions = []byte(`["test.view","test.edit"]`)
	config.DB.Save(&role)
	
	var role2 models.RBACRole
	config.DB.Where("key = ?", "faculty_admin").First(&role2)
	fmt.Println("New Permissions:", string(role2.Permissions))
}
